import Result from "./Result";
import Axios, { AxiosRequestConfig } from "axios";
import { transformUrl } from "domain-wait";
import queryString from "query-string";
import { isNode, showErrors, getNodeProcess } from "@Utils";
import SessionManager from "./session";
import {ROOT_API} from "@Config/api.config";

Axios.defaults.withCredentials = true;

export interface IRequestOptions {
    url: string;
    data?: any;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    isShowError?: boolean;
}

export interface ISendFormDataOptions {
    url: string;
    data: FormData;
    method: "POST" | "PUT" | "PATCH";
}

/**
 * Represents base class of the isomorphic service.
 */
export abstract class ServiceBase {

    /**
     * Make request with JSON data.
     * @param opts
     */
    public async requestJson<T>(opts: IRequestOptions): Promise<Result<T>> {

        var axiosResult = null;
        var result = null;

        opts.isShowError = opts.isShowError ?? true;

        // opts.url = `https://localhost:5001/${transformUrl(opts.url)}`; // Allow requests also for the Node.
        opts.url = `${ROOT_API}/${transformUrl(opts.url)}`; // Allow requests also for the Node.

        var processQuery = (url: string, data: any): string => {
            if (data) {
                return `${url}?${queryString.stringify(data)}`;
            }
            return url;
        };

        var axiosRequestConfig: AxiosRequestConfig;

        if (isNode()) {

            const ssrSessionData = SessionManager.getSessionContext().ssr;
            const { cookie } = ssrSessionData;

            // Make SSR requests 'authorized' from the NodeServices to the web server.
            axiosRequestConfig = {
                headers: {
                    Cookie: cookie
                }
            }
        }

        axiosRequestConfig = {
            withCredentials: true
        }
        

        try {
            switch (opts.method) {
                case "GET":
                    axiosResult = await Axios.get(processQuery(opts.url, opts.data), axiosRequestConfig);
                    break;
                case "POST":
                    axiosResult = await Axios.post(opts.url, opts.data, axiosRequestConfig);
                    break;
                case "PUT":
                    axiosResult = await Axios.put(opts.url, opts.data, axiosRequestConfig);
                    break;
                case "PATCH":
                    axiosResult = await Axios.patch(opts.url, opts.data, axiosRequestConfig);
                    break;
                case "DELETE":
                    axiosResult = await Axios.delete(processQuery(opts.url, opts.data), axiosRequestConfig);
                    break;
            }
            result = new Result(axiosResult.data.value, ...axiosResult.data.errors);
        } catch (error) {
            result = this.handleApiException(error);
            // result = new Result(null, error.message);
        }

        if (result.hasErrors && opts.isShowError) {
            showErrors(...result.errors);
        }

        return result;
    }

    private handleApiException(error) {
        if (error != null && error.response != null && error.response.data != null && error.response.data.Message != null) {
            return new Result(null, error.response.data.Message);
        }

        return new Result(null, error.message);
    }

    /**
     * Allows you to send files to the server.
     * @param opts
     */
    public async sendFormData<T>(opts: ISendFormDataOptions): Promise<Result<T>> {
        let axiosResult = null;
        let result = null;

        opts.url = transformUrl(opts.url); // Allow requests also for Node.

        var axiosOpts = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        try {
            switch (opts.method) {
                case "POST":
                    axiosResult = await Axios.post(opts.url, opts.data, axiosOpts);
                    break;
                case "PUT":
                    axiosResult = await Axios.put(opts.url, opts.data, axiosOpts);
                    break;
                case "PATCH":
                    axiosResult = await Axios.patch(opts.url, opts.data, axiosOpts);
                    break;
            }
            result = new Result(axiosResult.data.value, ...axiosResult.data.errors);
        } catch (error) {
            var message = (error as Error).message;
            result = new Result(null, message);
        }

        if (result.hasErrors) {
            showErrors(...result.errors);
        }

        return result;
    }
}