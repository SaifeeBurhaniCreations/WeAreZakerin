import api from "../lib/axios";

const LoginService = (formData: any) => {
    return api.post("/users/authentication/login", formData);
};

export { LoginService };