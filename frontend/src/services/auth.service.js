import api from "./api";

export const loginUser = async (data) => {
    return await api.post("/auth/login", data);
};

export const registerInstitute = async (data) => {
    return await api.post("/auth/register", data);
};

export const getProfile = async () => {
    return await api.get("/auth/profile");
};
