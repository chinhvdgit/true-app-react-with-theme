import Result from "@Core/Result";
import { ServiceBase } from "@Core/ServiceBase";
import SessionManager, { IServiceUser } from "@Core/session";
import { IDmKhModel as IDmKhModel } from "@Models/IDmKhModel";

export default class ArDmKhService extends ServiceBase {

    public async search(term: string = null): Promise<Result<IDmKhModel[]>> {
        if (term == null) {
            term = "";
        }
        var result = await this.requestJson<IDmKhModel[]>({
            url: `/api/Person/Search?term=${term}`,
            method: "GET"
        });
        return result;
    }

    public async update(model: IDmKhModel): Promise<Result<{}>> {
        var result = await this.requestJson({
            url: `/api/Person/${model.id}`,
            method: "PATCH",
            data: model
        });
        return result;
    }

    public async delete(id: number): Promise<Result<{}>> {
        var result = await this.requestJson({
            url: `/api/Person/${id}`,
            method: "DELETE"
        });
        return result;
    }

    public async add(model: IDmKhModel): Promise<Result<number>> {
        var result = await this.requestJson<number>({
            url: "/api/Person/Add",
            method: "POST",
            data: model
        });
        return result;
    }
}