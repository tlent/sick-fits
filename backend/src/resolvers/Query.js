const { forwardTo } = require("prisma-binding");

const Query = {
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  me(parent, args, context, info) {
    const { userID } = context.request;
    if (!userID) return null;
    return context.db.query.user({ where: { id: userID } }, info);
  }
};

module.exports = Query;
