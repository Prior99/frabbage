import { component, factory } from "tsdi";
import { createHashHistory, History } from "history";

@component
export class FactoryHistory {
    @factory({ name: "history" })
    public createHistory(): History {
        return createHashHistory();
    }
}

