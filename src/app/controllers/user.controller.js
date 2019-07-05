import Joi from 'joi';
import { hashSync } from 'bcrypt';
import { extend, pick } from 'lodash';

import User from '@app/models/user.model';

const userSchema = Joi.object().keys({
  fullName: Joi.string(),
  email: Joi.string().email().required(),
  mobileNumber: Joi.string().regex(/^[1-9][0-9]{9}$/),
  password: Joi.string().required(),
  repeatPassword: Joi.string().required().valid(Joi.ref('password'))
});
const UPDATE_USER_WHITELIST_FIELDS = ['fullName', 'mobileNumber', 'password'];

async function addNewUser(user) {
  user = await Joi.validate(user, userSchema, { abortEarly: false });
  // eslint-disable-next-line require-atomic-updates
  user.hashedPassword = hashSync(user.password, 10);

  delete user.password;

  return await new User(user).save();
}

async function updateUserInfo(req) {
  let updatingUser = req.user;
  updatingUser = extend(updatingUser, pick(req.body, UPDATE_USER_WHITELIST_FIELDS));
  updatingUser.updatedAt = Date.now;

  return await User.updateOne({ email: updatingUser.email }, updatingUser);
}

export { addNewUser, updateUserInfo };