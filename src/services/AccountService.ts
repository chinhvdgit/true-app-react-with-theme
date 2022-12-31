import Result from "@Core/Result";
import { ILoginModel } from "@Models/ILoginModel";
import { ServiceBase } from "@Core/ServiceBase";
import SessionManager, { IServiceUser } from "@Core/session";
import {API_IDENTITY_AUTHENTICATE, API_IDENTITY_REVOKE_TOKEN, API_IDENTITY_REFRESH_TOKEN} from "@Config/api.config";

export default class AccountService extends ServiceBase {

    public async login(loginModel: ILoginModel): Promise<Result<IServiceUser>> {
        // var result = await this.requestJson<IServiceUser>({
        //     url: "api/Account/Login",
        //     method: "POST",
        //     data: loginModel
        // });

        var result = await this.requestJson<IServiceUser>({
            url: API_IDENTITY_AUTHENTICATE, 
            method: "POST",
            data: loginModel
        });


        if (!result.hasErrors) {
            SessionManager.setServiceUser(result.value);

            this.startRefreshTokenTimer();
        }

        return result;
    }

    public async logout(): Promise<Result<{}>> {
        var result = await this.requestJson<IServiceUser>({
            url: API_IDENTITY_REVOKE_TOKEN, 
            method: "POST",
            data: {}
        });

        if (!result.hasErrors) {
            SessionManager.setServiceUser(null);
        }

        return result;
    }

    refreshTokenTimeout: number;

    public async refreshToken(obj: AccountService) {

        obj = obj ?? this;
        console.log('refreshToken', obj);

        var result = await obj.requestJson<IServiceUser>({
            url: API_IDENTITY_REFRESH_TOKEN, 
            method: "POST",
            isShowError: false,
            data: {}
        });

        if (!result.hasErrors) {
            SessionManager.setServiceUser(result.value);

            obj.startRefreshTokenTimer();
        }

        return result;
    }


    public startRefreshTokenTimer() {
        // parse json object from base64 encoded jwt token
        const jwtToken = JSON.parse(atob(SessionManager.getServiceUser().jwtToken.split('.')[1]));

        // {SessionManager.isAuthenticated ? SessionManager.getServiceUser().login : null}

        // const jwtToken = JSON.parse(atob(userSubject.value.jwtToken.split('.')[1]));

        // // set a timeout to refresh the token a minute before it expires
        const expires = new Date(jwtToken.exp * 1000);

        const timeout = expires.getTime() - Date.now() - (60 * 1000);

        console.log('timeout', timeout);
        this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout, this);
    }

    public stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }
}


