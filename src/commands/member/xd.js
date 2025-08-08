module.exports = {
  name: "reaccionar",
  description: "Reacciona con un emoji al mensaje",
  commands: ["cp", "rule34"],
  usage: "[comando]",
  handle: async ({ socket, webMessage }) => {
    const reactionMessage = {
      react: {
        text: "🧐",
        key: webMessage.key,
      },
    };
    
    await socket.sendMessage(webMessage.key.remoteJid, reactionMessage);
  },
};
