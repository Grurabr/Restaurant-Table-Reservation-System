export const isEmailValid = (email) => {
    const rule = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return rule.test(email.toString());
};

export const isPhoneValid = (phone) => {
    const rule = /((\+44(\s\(0\)\s|\s0\s|\s)?)|0)7\d{3}(\s)?\d{6}/;
    return rule.test(phone.toString());
};

export const isPwValid = (password) => {
    const rule = /.{8,}/;
    return rule.test(password.toString());
};

