/**
 * food-log controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::food-log.food-log',
    ({ strapi }) => ({

        async create(ctx) {
            const user = ctx.state.user;
            const body = ctx.request.body.data;
            if (!user) {
                return ctx.unauthorized("Login required");
            }

            body.users_permissions_user = user.id;
            const entry = await strapi.entityService.create(
                "api::food-log.food-log",
                {
                    data: body,
                    populate: ["users_permissions_user"],
                }
            );

            console.log(
                "FOOD LOG DEBUG - Saved entry:",
                JSON.stringify(entry, null, 2)
            );

            return entry;
        },

        async find(ctx) {
            const user = ctx.state.user;

            if (!user) {
                return ctx.unauthorized("Login required");
            }
            const result = await strapi.entityService.findMany(
                "api::food-log.food-log",
                {
                    filters: {
                        users_permissions_user: {
                            id: {
                                $eq: user.id,
                            },
                        },
                    },
                    populate: ["users_permissions_user"],
                }
            );
            return result;
        }
        ,

        async findOne(ctx) {
            const user = ctx.state.user;
            const { id } = ctx.params;

            const result = await strapi.entityService.findMany(
                "api::food-log.food-log", {
                filters: { id, users_permissions_user: user.id },
                populate: ["users_permissions_user"]
            }
            )
            if (!result.length) return ctx.notFound("Not found or not yours")
            return result[0];
        }
    })
);
