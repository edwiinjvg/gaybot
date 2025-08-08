/**
 * Evento llamado cuando un mensaje
 * es enviado al grupo de WhatsApp
 *
 * @author Dev Gui
 */
const {
  isAtLeastMinutesInPast,
  GROUP_PARTICIPANT_ADD,
  GROUP_PARTICIPANT_LEAVE,
  isAddOrLeave,
} = require("../utils");
const { DEVELOPER_MODE } = require("../config");
const { dynamicCommand } = require("../utils/dynamicCommand");
const { loadCommonFunctions } = require("../utils/loadCommonFunctions");
const { onGroupParticipantsUpdate } = require("./onGroupParticipantsUpdate");
const { errorLog, infoLog } = require("../utils/logger");
const { badMacHandler } = require("../utils/badMacHandler");
const { checkIfMemberIsMuted } = require("../utils/database");
const { messageHandler } = require("./messageHandler");

const fs = require('fs');
const path = require('path');

const USERS_DB_PATH = path.join(__dirname, '..', '..', 'database', 'users.json');

const getUsersData = () => {
    if (!fs.existsSync(USERS_DB_PATH)) {
      fs.writeFileSync(USERS_DB_PATH, JSON.stringify({}, null, 2));
    }
    const data = fs.readFileSync(USERS_DB_PATH, 'utf-8');
    return JSON.parse(data);
};

const saveUsersData = (data) => {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(data, null, 2));
};

const getMessageMentions = (webMessage) => {
    const mentions = webMessage.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    return mentions;
};

const handleAfkStatus = async (webMessage, sendReply, userJid) => {
    const users = getUsersData();
    let senderData = users[userJid];

    if (senderData && senderData.afk && senderData.afk.isAfk) {
        const afkTime = senderData.afk.time;
        const now = Date.now();
        const duration = Math.floor((now - afkTime) / (1000 * 60)); 
        
        delete senderData.afk;
        saveUsersData(users);

        await sendReply(`_¡Bienvenido de vuelta, *${webMessage.pushName}*! Estuviste ausente por *${duration}* minutos._`);
        return true; 
    }
    
    const mentions = getMessageMentions(webMessage);
    if (mentions.length > 0) {
        for (const mentionedJid of mentions) {
            const mentionedData = users[mentionedJid];
            if (mentionedData && mentionedData.afk && mentionedData.afk.isAfk) {
                const afkReason = mentionedData.afk.reason;
                const afkTime = mentionedData.afk.time;
                const now = Date.now();
                const duration = Math.floor((now - afkTime) / (1000 * 60));

                // --- CORRECCIÓN: USAMOS UN FALLBACK POR SI NO HAY NOMBRE ---
                const afkUserName = mentionedData.name || mentionedJid.split('@')[0];

                const afkMessage = `_¡Advertencia!_\n_No menciones a *${afkUserName}*, está AFK._\n*Razón:* ${afkReason}\n*Ausente por:* ${duration} minutos.`;
                await sendReply(afkMessage);
                return true; 
            }
        }
    }

    return false;
};


exports.onMessagesUpsert = async ({ socket, messages, startProcess }) => {
  if (!messages.length) {
    return;
  }

  for (const webMessage of messages) {
    if (DEVELOPER_MODE) {
      infoLog(
        `\n\n⪨========== [ MENSAJE RECIBIDO ] ==========⪩ \n\n${JSON.stringify(
          messages,
          null,
          2
        )}`
      );
    }

    try {
      const messageText = webMessage.message?.conversation || 
                          webMessage.message?.extendedTextMessage?.text || 
                          webMessage.message?.editedMessage?.conversation ||
                          webMessage.message?.editedMessage?.extendedTextMessage?.text;

      if (messageText && !webMessage.key.fromMe) {
        const lowerCaseMessage = messageText.toLowerCase();

        const reactions = [
          { keyword: 'edwin', emoji: '❤️' },
          { keyword: 'bot', emoji: '👋🏻' },
          { keyword: 'alex', emoji: '🏳️‍🌈' }
        ];

        for (const reaction of reactions) {
          if (lowerCaseMessage.includes(reaction.keyword)) {
            await socket.sendMessage(webMessage.key.remoteJid, {
              react: {
                text: reaction.emoji,
                key: webMessage.key,
              },
            });
            break;
          }
        }
      }

      const timestamp = webMessage.messageTimestamp;

      if (webMessage?.message) {
        messageHandler(socket, webMessage);
      }

      if (isAtLeastMinutesInPast(timestamp)) {
        continue;
      }

      if (isAddOrLeave.includes(webMessage.messageStubType)) {
        let action = "";
        if (webMessage.messageStubType === GROUP_PARTICIPANT_ADD) {
          action = "add";
        } else if (webMessage.messageStubType === GROUP_PARTICIPANT_LEAVE) {
          action = "remove";
        }

        await onGroupParticipantsUpdate({
          userJid: webMessage.messageStubParameters[0],
          remoteJid: webMessage.key.remoteJid,
          socket,
          action,
        });
      } else {
        const commonFunctions = loadCommonFunctions({ socket, webMessage });

        if (!commonFunctions) {
          continue;
        }

        if (
          checkIfMemberIsMuted(
            commonFunctions.remoteJid,
            commonFunctions.userJid
          )
        ) {
          try {
            await commonFunctions.deleteMessage(webMessage.key);
          } catch (error) {
            errorLog(
              `_Error al eliminar mensaje de miembro silenciado, ¡probablemente no soy administrador del grupo!_`
            );
          }
          return;
        }
        
        const afkHandled = await handleAfkStatus(
            webMessage, 
            commonFunctions.sendReply, 
            commonFunctions.userJid
        );
        
        if (afkHandled) {
            continue;
        }

        await dynamicCommand(commonFunctions, startProcess);
      }
    } catch (error) {
      if (badMacHandler.handleError(error, "message-processing")) {
        continue;
      }

      if (badMacHandler.isSessionError(error)) {
        errorLog(`Error de sesión al procesar mensaje: ${error.message}`);
        continue;
      }

      errorLog(
        `Error al procesar mensaje: ${error.message} | Stack: ${error.stack}`
      );

      continue;
    }
  }
};

