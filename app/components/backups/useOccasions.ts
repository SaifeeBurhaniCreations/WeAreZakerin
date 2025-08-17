import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    setOccassions,
    setOccassionGroups,
    addOccassion,
    Occassion,
    removeOccassion,
    updateOccassion as updateOccassionRedux
} from "../redux/slices/OccassionSlice";
import {
    fetchAllOccasions,
    fetchOccasionsByDate,
    fetchOccasionsByMonth,
    fetchOccasionsByYear,
    fetchOccasionGroups,
    fetchOccasionPending,
    createOccasion,
    fetchOccasionById,
    updateOccasion as updateOccasionService,
    deleteOccasion as removeOccasionService
} from "../service/OccassionService";
import { RootState } from "../redux/store";



// 1️⃣ Fetch ALL occasions with loading/error/success handling
export const useOccasions = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const dispatch = useDispatch();

    const occasions = useSelector((state: RootState) => state.occassions);

    useEffect(() => {
        const loadOccasions = async () => {
            if (!occasions || occasions.length === 0) {
                try {
                    setIsLoading(true);
                    setIsError(false);
                    const res = await fetchAllOccasions();
                    dispatch(setOccassions(res.data));
                    setIsSuccess(true);
                } catch (error) {
                    setIsError(true);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadOccasions();
    }, [dispatch, occasions]);


    return { data: occasions, isLoading, isError, isSuccess };
};


// 2️⃣ Create NEW occasion
export const useCreateOccasion = () => {
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const create = useCallback(
        async (data: any) => {
            setIsLoading(true);
            setIsError(false);
            setIsSuccess(false);

            try {
                const response = await createOccasion(data);

                if (response.status === 201) {
                    dispatch(addOccassion(response.data));

                    setIsSuccess(true);

                    return { success: true, data: response.data };
                } else {
                    // ✅ Handle server-side error
                    const errMsg = response.data?.error || "Something went wrong";
                    setIsError(true);
                    return { success: false, error: errMsg };
                }
            } catch (err: any) {
                setIsError(true);
                const errMsg = err?.message || "Request failed";
                return { success: false, error: errMsg };
            } finally {
                setIsLoading(false);
            }
        },
        [dispatch]
    );

    return { create, isLoading, isError, isSuccess };
};

export const usePendingOccasions = (status: string | string[] = ['pending', 'started', 'ended']) => {
    const [data, setData] = useState<Occassion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const allOccasions = useSelector((state: RootState) => state.occassions);

    useEffect(() => {
        const loadOccasions = async () => {
            try {
                setIsLoading(true);
                setIsError(false);
                setIsSuccess(false);

                // Normalize status parameter to array for consistent filtering
                const statuses = Array.isArray(status) ? status : [status];

                if (allOccasions && allOccasions.length > 0) {
                    // Filter occasions from Redux store by any of the statuses requested
                    const filtered = allOccasions.filter(o => statuses.includes(o.status));
                    setData(filtered);
                    setIsSuccess(true);
                } else {
                    const res = await fetchOccasionPending(statuses);
                    setData(res.data || []);
                    setIsSuccess(true);
                }
            } catch (error) {
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };

        loadOccasions();
    }, [allOccasions]);

    return { data, isLoading, isError, isSuccess };
};

export const useDeleteOccasion = () => {
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const deleteOccasion = useCallback(
        async (occasionId: string) => {
            if (!occasionId) {
                setIsError(true);
                return { success: false, error: 'Invalid occasion ID' };
            }

            setIsLoading(true);
            setIsError(false);
            setIsSuccess(false);

            try {
                const response = await removeOccasionService(occasionId);

                if (response.status === 200) {
                    // Remove from Redux store optimistically
                    dispatch(removeOccassion(occasionId));
                    setIsSuccess(true);
                    return { success: true };
                } else {
                    const errMsg = response.data?.error || 'Failed to delete occasion';
                    setIsError(true);
                    return { success: false, error: errMsg };
                }
            } catch (err: any) {
                const errMsg = err?.message || 'Request failed';
                setIsError(true);
                return { success: false, error: errMsg };
            } finally {
                setIsLoading(false);
            }
        },
        [dispatch]
    );

    return { deleteOccasion, isLoading, isError, isSuccess };
};

export const useUpdateOccassion = () => {
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const updateOccassion = useCallback(
        async (occasionId: string, data: any) => {
            if (!occasionId) {
                setIsError(true);
                return { success: false, error: 'Invalid occasion ID' };
            }

            setIsLoading(true);
            setIsError(false);
            setIsSuccess(false);

            try {
                const response = await updateOccasionService(occasionId, data);

                if (response.status === 200) {
                    // Update occasion data in Redux store
                    dispatch(updateOccassionRedux(response.data));
                    setIsSuccess(true);
                    return { success: true, data: response.data };
                } else {
                    const errMsg = response.data?.error || 'Failed to update occasion';
                    setIsError(true);
                    return { success: false, error: errMsg };
                }
            } catch (err: any) {
                const errMsg = err?.message || 'Request failed';
                setIsError(true);
                return { success: false, error: errMsg };
            } finally {
                setIsLoading(false);
            }
        },
        [dispatch]
    );

    return { updateOccassion, isLoading, isError, isSuccess };
};

// 3️⃣ Fetch SINGLE occasion by ID (with store check)
export const useOccasionById = (id: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const dispatch = useDispatch();
    const [data, setData] = useState<Occassion>()
    const occasion = useSelector((state: RootState) =>
        state.occassions.find((o) => o._id === id)
    );

    useEffect(() => {
        const loadOccasion = async () => {
            if (!occasion) {
                try {
                    setIsLoading(true);
                    setIsError(false);
                    const res = await fetchOccasionById(id);
                    setData(res.data)
                    setIsSuccess(true);
                } catch (error) {
                    setIsError(true);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setData(occasion)
                setIsSuccess(true);
            }
        };

        loadOccasion();
    }, [dispatch, id, occasion]);



    return { data, isLoading, isError, isSuccess };
};

// 2️⃣ Occasions by Date
export const useOccasionsByDate = (date: string) => {
    const dispatch = useDispatch();
    const occassions = useSelector((state: RootState) => state.occassions);

    useEffect(() => {
        const load = async () => {
            if (!occassions || occassions.length === 0) {
                const res = await fetchOccasionsByDate(date);
                dispatch(setOccassions(res.data.occasions));
            }
        };
        load();
    }, [date]);

    return occassions;
};

// 3️⃣ Occasions by Month
export const useOccasionsByMonth = (month: string) => {
    const dispatch = useDispatch();
    const occassions = useSelector((state: RootState) => state.occassions);

    useEffect(() => {
        const load = async () => {
            if (!occassions || occassions.length === 0) {
                const res = await fetchOccasionsByMonth(month);
                dispatch(setOccassions(res.data.occasions));
            }
        };
        load();
    }, [month]);

    return occassions;
};

// 4️⃣ Occasions by Year
export const useOccasionsByYear = (year: string) => {
    const dispatch = useDispatch();
    const occassions = useSelector((state: RootState) => state.occassions);

    useEffect(() => {
        const load = async () => {
            if (!occassions || occassions.length === 0) {
                const res = await fetchOccasionsByYear(year);
                dispatch(setOccassions(res.data));
            }
        };
        load();
    }, [year]);

    return occassions;
};

// 5️⃣ Grouped Parties
export const useOccasionGroups = () => {
    const dispatch = useDispatch();
    const occassions = useSelector((state: RootState) => state.occassions); // You might want a separate "groups" state

    useEffect(() => {
        const load = async () => {
            if (!occassions || occassions.length === 0) {
                const res = await fetchOccasionGroups();
                dispatch(setOccassionGroups(res.data));
            }
        };
        load();
    }, []);

    return occassions;
};
