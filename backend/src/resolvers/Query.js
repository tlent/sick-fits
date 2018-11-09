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
  },
  async order(parent, args, context, info) {
    const { user } = context.request;
    if (!user) throw new Error("Must be logged in");
    const order = await context.db.query.order(
      { where: { id: args.orderID } },
      info
    );
    if (!order) return;
    const userOwnsOrder = order.user.id === user.id;
    const userIsAdmin = user.permissions.includes("ADMIN");
    if (!userIsAdmin && !userOwnsOrder) {
      throw new Error("You don't have permission");
    }
    return order;
  },
  orders(parent, args, context, info) {
    const { user } = context.request;
    if (!user) throw new Error("Must be logged in");
    return context.db.query.orders(
      {
        ...args,
        where: { user: { id: user.id } }
      },
      info
    );
  }
};

module.exports = Query;
