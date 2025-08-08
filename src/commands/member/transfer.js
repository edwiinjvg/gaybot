/**
 * @author Edwin
 * @description Muestra las opciones para transferir monedas o diamantes.
 */
const { getPrefix } = require("../../utils/database");

module.exports = {
  name: "trans",
  description: "Muestra las opciones de transferencia para monedas y diamantes.",
  commands: ["transfer", "transferir", "trans"],
  usage: "<prefix>trans1 <cantidad> (Monedas) o <prefix>trans2 <cantidad> (Diamantes)",
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply }) => {

    const prefix = getPrefix();
    
    return sendReply(`_Usa *${prefix}transfer1 <cantidad>* para transferir monedas._ 🪙\n_Usa *${prefix}transfer2 <cantidad>* para transferir diamantes._ 💎`);
  },
};

