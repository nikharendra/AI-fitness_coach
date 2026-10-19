
const allowedFields = [
  "age",
  "weight",
  "height",
  "goal",
  "dailyCalorieIntake",
  "dailyCalorieBurn",
] as const;

export default {
  async update(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("Login required");
    }

    const body = ctx.request.body ?? {};
    const input = body.data ?? body;

    if (
      !input ||
      typeof input !== "object" ||
      Array.isArray(input)
    ) {
      return ctx.badRequest("Invalid profile data");
    }

    const data: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(input, field)) {
        data[field] = input[field];
      }
    }

    if (Object.keys(data).length === 0) {
      return ctx.badRequest("No valid profile fields provided");
    }

    const updatedUser = await strapi.db
      .query("plugin::users-permissions.user")
      .update({
        where: { id: user.id },
        data,
      });

    if (!updatedUser) {
      return ctx.notFound("User not found");
    }

    ctx.body = {
      message: "Profile updated successfully",
      data: {
        id: updatedUser.id,
        age: updatedUser.age,
        weight: updatedUser.weight,
        height: updatedUser.height,
        goal: updatedUser.goal,
        dailyCalorieIntake: updatedUser.dailyCalorieIntake,
        dailyCalorieBurn: updatedUser.dailyCalorieBurn,
      },
    };
  },
};
