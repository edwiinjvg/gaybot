/**
 * @author Edwin
 * @description Muestra las opciones de apuesta para la máquina tragamonedas.
 */
const { getPrefix } = require("../../utils/database");

module.exports = {
  name: "slot",
  description: "Muestra las opciones de apuesta para la máquina tragamonedas.",
  commands: ["slot", "casino", "apuesta", "apostar"],
  usage: "<prefix>slot1 <cantidad> (Monedas) o <prefix>slot2 <cantidad> (Diamantes)",
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply }) => {
    const prefix = getPrefix(); // Ahora se obtiene el prefijo correctamente
    return sendReply(`_Usa *${prefix}slot1 <cantidad>* para apostar monedas._ 🪙\n_Usa *${prefix}slot2 <cantidad>* para apostar diamantes._ 💎`);
  },
};

