import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    setOccassions,
    setOccassionGroups,
    addOccassion,
    Occassion
} from "../redux/slices/OccassionSlice";
import {
    fetchAllOccasions,
    fetchOccasionsByDate,
    fetchOccasionsByMonth,
    fetchOccasionsByYear,
    fetchOccasionGroups,
    fetchOccasionPending,
    createOccasion,
    fetchOccasionById
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
                    dispatch(setOccassions(res.data.occasions));
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

    return { occasions, isLoading, isError, isSuccess };
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
                    console.log(response.data);
                    
                    dispatch(addOccassion(response.data));
                    setIsSuccess(true);
                } else {
                    setIsError(true);
                }
                return response.data;
            } catch (error) {
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        },
        [dispatch]
    );

    return { create, isLoading, isError, isSuccess };
};

export const usePendingOccasions = () => {
    const [data, setData] = useState<Occassion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const allOccasions = useSelector((state: RootState) => state.occassions);

    useEffect(() => {
        const loadPending = async () => {
            try {
                setIsLoading(true);
                setIsError(false);

                if (allOccasions && allOccasions.length > 0) {
                    // Filter from Redux
                    const pendingOnes = allOccasions.filter(o => o.status === "pending");
                    setData(pendingOnes);
                    setIsSuccess(true);
                } else {
                    // Fetch from API directly (not stored in Redux)
                    const res = await fetchOccasionPending('pending');
                    setData(res.data || []);
                    setIsSuccess(true);
                }
            } catch (error) {
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };

        loadPending();
    }, [allOccasions]);

    return { data, isLoading, isError, isSuccess };
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
