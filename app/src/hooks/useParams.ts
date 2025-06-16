import { useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types";

export function useParams<
    RouteName extends keyof RootStackParamList,
    ParamNames extends (keyof RootStackParamList[RouteName])[]
>(
    routeName: RouteName,
    ...paramNames: ParamNames
): { [K in ParamNames[number]]: RootStackParamList[RouteName][K] | undefined } {
    const route = useRoute<RouteProp<RootStackParamList, RouteName>>();
    const params = (route.params || {}) as Partial<RootStackParamList[RouteName]>;

    const selectedParams = {} as {
        [K in ParamNames[number]]: RootStackParamList[RouteName][K] | undefined;
    };

    paramNames.forEach((name) => {
        selectedParams[name] = params[name];
    });

    return selectedParams;
}