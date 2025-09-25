import { createResourceHooks } from "../lib/ReSyncDB";
import { Occassion } from "../redux/slices/OccassionSlice";
import {
    fetchAllOccasions,
    createOccasion,
    fetchOccasionById,
    updateOccasion,
    deleteOccasion
} from "../service/OccassionService";


export const useOccasionsDB = createResourceHooks<Occassion>({
    rootKey: "occasions-syncDB",
    services: {
        fetchAll: (params) => fetchAllOccasions(params).then(res => res.data),
        fetchOne: (id) => fetchOccasionById(id).then(res => res.data),
        create: (data) => createOccasion(data).then(res => res.data),
        update: (id, data) => updateOccasion(id, data).then(res => res.data),
        delete: (id) => deleteOccasion(id).then(res => res.data),
    },
    socketEvents: [
        {
            event: "occasion:created",
            handler: (data: Occassion, queryClient) => {
                queryClient.setQueryData<Occassion[]>(["occasions"], (old = []) => {
                    if (old.some((x) => x._id === data._id)) return old;
                    return [data, ...old];
                });
            },
        },
    ],
});
