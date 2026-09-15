import dotenv from "dotenv"
dotenv.config()

export function getModel() {
    const MODEL = process.env.MODEL
    const DEFAULT_MODEL = "inclusionai/ling-3.0-flash-vl:free"
    if (MODEL)
        return MODEL;
    return DEFAULT_MODEL;
}
