/**
 * Desenvolvido por: Mkg
 * Refatorado por: Dev Gui
 *
 * @author Dev Gui
 */
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);
const {
  checkIfMemberIsMuted,
  muteMember,
} = require(`${BASE_DIR}/utils/database`);
const {
  PREFIX,
  BOT_NUMBER,
  OWNER_NUMBER,
  OWNER_LID,
} = require(`${BASE_DIR}/config`);

const { DangerError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "mute",
  description:
    "Silencia un usuario del grupo.",
  commands: ["mute", "mutar", "silenciar"],
  usage: `${PREFIX}mute @usuario`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    remoteJid,
    replyJid,
    userJid,
    sendErrorReply,
    sendSuccessReply,
    getGroupMetadata,
    socket,
    isGroupWithLid,
    isGroup,
  }) => {
    if (!isGroup) {
      throw new DangerError("_¡Este comando solo puede ser utilizado en grupos!_");
    }

    if (!args.length && !replyJid) {
      throw new DangerError(
        `_Mencione a un usuario para silenciarlo._`
      );
    }

    const targetUserNumber = args.length
      ? onlyNumbers(args[0])
      : isGroupWithLid
      ? replyJid
      : onlyNumbers(replyJid);

    if ([OWNER_NUMBER, OWNER_LID].includes(targetUserNumber)) {
      throw new DangerError("_¡No puedes silenciar a mi dueño!_");
    }

    const targetUserJid = isGroupWithLid
      ? targetUserNumber
      : toUserJid(targetUserNumber);

    if (targetUserJid === toUserJid(BOT_NUMBER)) {
      throw new DangerError("_¡No puedes silenciarme!_");
    }

    const [result] =
      replyJid && isGroupWithLid
        ? [{ jid: targetUserJid, lid: targetUserJid }]
        : await socket.onWhatsApp(targetUserNumber);

    if (result.jid === userJid) {
      throw new DangerError("_¡No puedes silenciarte a ti mismo!_");
    }

    const groupMetadata = await getGroupMetadata();

    const isUserInGroup = groupMetadata.participants.some(
      (participant) => participant.id === targetUserJid
    );

    if (!isUserInGroup) {
      return sendErrorReply(
        `_@${targetUserNumber} no está en este grupo._`,
        [targetUserJid]
      );
    }

    const isTargetAdmin = groupMetadata.participants.some(
      (participant) => participant.id === targetUserJid && participant.admin
    );

    if (isTargetAdmin) {
      throw new DangerError("_No puedes silenciar a un administrador._");
    }

    if (checkIfMemberIsMuted(remoteJid, targetUserJid)) {
      return sendErrorReply(
        `_@${targetUserNumber} ya está silenciado en este grupo._`,
        [targetUserJid]
      );
    }

    muteMember(remoteJid, targetUserJid);

    await sendSuccessReply(
      `_¡@${targetUserNumber} fue silenciado con éxito en este grupo!_`,
      [targetUserJid]
    );
  },
};
