import { GenderEnum } from "../../../../entities";
import { updateObject } from "../../../../utils/utils";
import { userConstants } from "../../../../view/action";
import { IAuth } from "../../interfaces";
import { Action } from "../../type";

const initialState: IAuth = {
  user: "",
  avatar: "",
  phone: "",
  gender: GenderEnum.male,
  name: "",
  error: "",
  loading: false,
};

const authStart = (state: IAuth, action: Action) => {
  return updateObject(state, { error: "", loading: true });
};

const authSuccess = (state: IAuth, action: Action) => {
  return updateObject(state, {
    user: action.payload.user,
    avatar: action.payload.avatar,
    phone: action.payload.phone,
    gender: +action.payload.gender,
    name: action.payload.name,
    error: "",
    loading: false,
  });
};

const authFail = (state: IAuth, action: Action) => {
  return updateObject(state, {
    user: null,
    error: action.payload.error,
    loading: false,
  });
};

function logoutStart(state: IAuth, action: Action) {
  return updateObject(state, { error: null, loading: true });
}

function logoutSuccess(state: IAuth, action: Action) {
  return updateObject(state, {
    ...initialState,
  });
}

function logoutFail(state: IAuth, action: Action) {
  return updateObject(state, {
    error: action.payload?.error,
    loading: false,
  });
}

const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case userConstants.LOGIN_REQUEST:
      return authStart(state, action);
    case userConstants.LOGIN_SUCCESS:
      return authSuccess(state, action);
    case userConstants.LOGIN_FAILURE:
      return authFail(state, action);
    case userConstants.LOGOUT_REQUEST:
      return logoutStart(state, action);
    case userConstants.LOGOUT_SUCESS:
      return logoutSuccess(state, action);
    case userConstants.LOGOUT_REQUEST:
      return logoutFail(state, action);
    default:
      return state;
  }
};

export default reducer;
