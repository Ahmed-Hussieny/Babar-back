import { systemRoles } from "../../utils/system-roles.js";

export const restaurantRoles = {
    ADD_RESTAURANT: [systemRoles.ADMIN],
    VERIFY_RESTAURANT: [systemRoles.ADMIN],
};