const { OWNER_NUMBER } = require("../../config");

const { PREFIX, BOT_NUMBER } = require(`${BASE_DIR}/config`);
const { DangerError, InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "ban",
  description: "Elimino un miembro del grupo",
  commands: ["ban", "kick"],
  usage: `${PREFIX}ban @mencionar_miembro 
  
o 

${PREFIX}ban (mencionando un mensaje)`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    isReply,
    socket,
    remoteJid,
    replyJid,
    sendReply,
    userJid,
    isLid,
    sendSuccessReact,
  }) => {
    if (!args.length && !isReply) {
      throw new InvalidParameterError(
        "_¡Necesitas mencionar o responder a un miembro!_"
      );
    }

    let memberToRemoveId = null;

    if (isLid) {
      const [result] = await socket.onWhatsApp(onlyNumbers(args[0]));

      if (!result) {
        throw new WarningError(
          "_¡El número proporcionado no está registrado en WhatsApp!_"
        );
      }

      memberToRemoveId = result.lid;
    } else {
      const memberToRemoveJid = isReply ? replyJid : toUserJid(args[0]);
      const memberToRemoveNumber = onlyNumbers(memberToRemoveJid);

      if (memberToRemoveNumber.length < 7 || memberToRemoveNumber.length > 15) {
        throw new InvalidParameterError("¡Número inválido!");
      }

      if (memberToRemoveJid === userJid) {
        throw new DangerError("_¡No puedes eliminarte a ti mismo!_");
      }

      if (memberToRemoveNumber === OWNER_NUMBER) {
        throw new DangerError("_¡No puedes eliminar al dueño del bot!_");
      }

      const botJid = toUserJid(BOT_NUMBER);

      if (memberToRemoveJid === botJid) {
        throw new DangerError("_¡No puedes eliminarme!_");
      }

      memberToRemoveId = memberToRemoveJid;
    }

    await socket.groupParticipantsUpdate(
      remoteJid,
      [memberToRemoveId],
      "remove"
    );

    await sendSuccessReact();

    await sendReply("_¡Un imbécil fue eliminado con éxito!_ 🔥");
  },
};
