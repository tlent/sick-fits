const { forwardTo } = require("prisma-binding");
const { hasPermission } = require("../utils");

const Query = {
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  me(parent, args, context, info) {
    const { userID } = context.request;
    if (!userID) return null;
    return context.db.query.user({ where: { id: userID } }, info);
  },
  users(parent, args, context, info) {
    if (!context.request.userID) {
      throw new Error("Must be logged in");
    }
    hasPermission(context.request.user, ["ADMIN", "PERMISSIONUPDATE"]);
    return context.db.query.users({}, info);
  }
};

module.exports = Query;
