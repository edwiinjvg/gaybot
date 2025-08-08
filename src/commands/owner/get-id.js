const { PREFIX } = require(`${BASE_DIR}/config`);
const { WarningError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "get-id",
  description: "Devuelve el ID completo de un grupo en formato JID.",
  commands: ["getid", "getgroupid", "idget", "idgroup"],
  usage: `${PREFIX}get-id`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ remoteJid, sendSuccessReply, isGroup }) => {
    if (!isGroup) {
      throw new WarningError("_Este comando solo puede ser utilizado en grupos._");
    }

    await sendSuccessReply(`*_ID del grupo:_* _${remoteJid}_`);
  },
};
