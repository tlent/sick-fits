const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");

const TOKEN_COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 365; // 365 Days

function addTokenCookieToResponse(response, token) {
  response.cookie("token", token, {
    httpOnly: true,
    maxAge: TOKEN_COOKIE_MAX_AGE
  });
}

function signJWT(payload) {
  return JWT.sign(payload, process.env.APP_SECRET);
}

const Mutation = {
  async createItem(parent, args, ctx, info) {
    const item = await ctx.db.mutation.createItem({ data: { ...args } }, info);
    return item;
  },
  async updateItem(parent, args, ctx, info) {
    const updates = { ...args };
    delete updates.id;
    return ctx.db.mutation.updateItem(
      { data: updates, where: { id: args.id } },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    const item = await ctx.db.query.item({ where }, "{ id, title }");
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser(
      { data: { ...args, password, permissions: { set: ["USER"] } } },
      info
    );
    const token = signJWT({ userID: user.id });
    addTokenCookieToResponse(ctx.response, token);
    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) throw new Error(`No such user found with email ${email}`);
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) throw new Error("Incorrect password");
    const token = signJWT({ userID: user.id });
    addTokenCookieToResponse(ctx.response, token);
    return user;
  },
  async signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return { message: "Goodbye!" };
  },
  async requestReset(parent, { email }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) throw new Error(`No such user found with email ${email}`);
    const resetToken = (await promisify(randomBytes)(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    const response = await ctx.db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    });
    console.log(response);
    return { message: "Ok" };
  },
  async resetPassword(parent, args, ctx, info) {
    if (args.password !== args.confirmPassword)
      throw new Error("Passwords do not match");
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });
    if (!user) throw new Error("Invalid or expired reset token");
    const password = await bcrypt.hash(args.password, 10);
    const updatedUser = await ctx.db.mutation.updateUser(
      {
        where: { id: user.id },
        data: { password, resetToken: null, resetTokenExpiry: null }
      },
      info
    );
    const jwt = signJWT({ userID: updatedUser.id });
    addTokenCookieToResponse(ctx.response, jwt);
    return updatedUser;
  }
};

module.exports = Mutation;
