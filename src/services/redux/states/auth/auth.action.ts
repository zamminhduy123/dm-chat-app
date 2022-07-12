import { userConstants } from "../../../../view/action";
import { Action } from "../../type";
import { IAuth } from "../../interfaces/IAuth";

export const loginRequest = () => {
  return {
    type: userConstants.LOGIN_REQUEST,
  };
};

export const loginSuccess = (data: IAuth): Action => {
  return {
    type: userConstants.LOGIN_SUCCESS,
    payload: {
      ...data,
    },
  };
};

export const loginFail = (message: string): Action => {
  return {
    type: userConstants.LOGIN_FAILURE,
    payload: {
      error: message,
    },
  };
};

export const logoutRequest = (): Action => {
  return {
    type: userConstants.LOGOUT_REQUEST,
  };
};

export const logoutSuccess = (): Action => {
  return {
    type: userConstants.LOGOUT_SUCESS,
  };
};

export const logoutFail = (error: string): Action => {
  return {
    type: userConstants.LOGOUT_FAIL,
    payload: {
      error: error,
    },
  };
};

export const authCheckState = () => {
  return (dispatch: any) => {
    // const token = localStorage.getItem('token');
    // if (!token) {
    //     dispatch(logout());
    // } else {
    //     const expirationDate = new Date(localStorage.getItem('expirationDate'));
    //     if(expirationDate <= new Date()) {
    //         dispatch(logout());
    //     } else {
    //         const userId = localStorage.getItem('userId');
    //         dispatch(authSuccess(token, userId));
    //         dispatch(checkAuthTimeout((expirationDate.getTime() - new Date().getTime()) / 1000 ));
    //     }
    // }
  };
};
