import { t } from "i18next";
import React from "react";
import { useForm, SubmitHandler, set } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { UserController } from "../../../../controller";
import { RegisterData } from "../../../../entities/type/RegisterData";
import { StrengthChecker } from "../../../../utils/passwordStrongCheck";
import { imageValidation } from "../../../../utils/utils";

type IRegisterFormInput = {
  name: string;
  username: string;
  password: string;
  retypePassword: string;
  gender: string;
  avatar: string;
  phone: string;
};
const initNotification = {
  type: "warning",
  message: "",
};

export const RegisterViewModel = () => {
  const [notification, setNotification] = React.useState(initNotification);
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IRegisterFormInput>();

  const history = useHistory();

  const onSubmit: SubmitHandler<IRegisterFormInput> = async ({
    username,
    password,
    gender,
    phone,
    name,
  }) => {
    const data: RegisterData = {
      username,
      password,
      gender,
      phone,
      name,
      avatar: avatarFile ? avatarFile : null,
    };
    if (passwordStrength.id === 0) {
      setNotification({
        type: "warning",
        message: t("Your password need to be stronger"),
      });
      return;
    }

    setNotification({
      type: "loading",
      message: t("Loading"),
    });
    UserController.getInstance()
      .register(data)
      .then(() => {
        setNotification({
          type: "success",
          message: t("Please login to generate secret key"),
        });
        setTimeout(() => {
          history.push("/login");
        }, 2000);
        UserController.getInstance().checkKeyExist(data.username);
      })
      .catch((err: any) => {
        console.log("Register Error", err);
        setNotification({
          type: "error",
          message: t(err),
        });
      });
  };

  const inputPassword = watch("password") || "";
  const retypePassword = watch("retypePassword") || "";
  const passwordStrength = StrengthChecker(inputPassword);

  const getPasswordMessage = (contains: string[], length: number) => {
    if (length < 8) {
      return t("Password too short");
    }
    const pwdConstraints = ["number", "lowercase", "uppercase", "symbol"];
    const filters = pwdConstraints.filter((cons) => !contains.includes(cons));
    if (filters.length > 0) {
      for (const f of filters) {
        return t("Password should have") + " " + t(f);
      }
    }
    // console.log(filters, contains);
    return "";
  };

  const isPasswordMatch = () => {
    return retypePassword === inputPassword;
  };

  const [formPage, setFormPage] = React.useState<0 | 1>(0);
  const imageInput = React.useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = React.useState<File>();
  const [avatar, setAvatar] = React.useState("");
  const imageSelected: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    if (imageInput.current && imageInput.current.files) {
      var reader = new FileReader();
      reader.onload = function (e) {
        if (reader.result) {
          if (!imageValidation(reader.result.toString())) {
            setNotification({
              type: "error",
              message: t("Valid image ext") + ": png/jpeg/webp",
            });
          } else {
            // console.log(reader.result);
            setAvatar(reader.result.toString());
          }
        }
      };
      const imageFile = /image.*/;
      if (imageInput.current.files[0].type.match(imageFile)) {
        reader.readAsDataURL(imageInput.current.files[0]);
        setAvatarFile(imageInput.current.files[0]);
      } else {
        setNotification({
          type: "error",
          message: t("Valid image ext") + ": png/jpeg/webp",
        });
      }
    }
  };

  React.useEffect(() => {
    if (formPage === 1) {
      if (errors.username || errors.password || errors.retypePassword) {
        setNotification({
          type: "error",
          message: t("Error at previous page"),
        });
      }
    }
  }, [formPage, errors.username, errors.password, errors.retypePassword]);

  return {
    avatar,
    setAvatar,

    imageInput,
    imageSelected,
    formPage,
    setFormPage,
    inputPassword,
    retypePassword,
    passwordStrength,
    onSubmit,
    handleSubmit,
    getPasswordMessage,
    isPasswordMatch,
    register,
    watch,
    notification,
    errors,
  };
};
