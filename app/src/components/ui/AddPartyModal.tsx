import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/src/redux/store";
import { handleAddGroup, toggleModal } from "@/src/redux/slices/AddPartySlice";
import { useEffect, useRef, useState } from "react";
import { AddDataModalRef } from "@/src/types";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import BottomSheetModal from "./modals/BottomSheetModal";
import Input from "./Input";
import Select from "./Select";
import { View } from "moti";
import { PartyFormData, partySchema } from "@/src/schemas/PartySchema";
import { createGroup } from "@/src/service/GroupService";
import Button from "./Button";
import { handleAddUser } from "@/src/redux/slices/UserSlice";

const AddPartyModal = () => {
    const dispatch = useDispatch();
    const modalRef = useRef<AddDataModalRef>(null);
    const { isModalOpen } = useSelector((state: RootState) => state.modal);
    const [loading, setLoading] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string>("");
    const { users } = useSelector((state: RootState) => state.users);

    const filterAdmins = users?.filter(value => value?.belongsto === '' && value?.role !== 'member')

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        reset,
        setValue,
        watch,
    } = useForm<PartyFormData>({
        resolver: zodResolver(partySchema),
        mode: "onChange",
        defaultValues: {
            selectedValue: "",
            userid: "",
            fullname: "",
            phone: "",
            address: "",
        },
    });


    const onSubmit: SubmitHandler<PartyFormData> = async (data) => {
        let payload;

        if (data.selectedValue === "add_admin") {
            payload = {
                name: data.name,
                userDetails: {
                    userid: Number(data.userid),
                    fullname: data.fullname,
                    phone: Number(data.phone),
                    address: data.address,
                }
            };
        } else {
            payload = {
                adminId: data.selectedValue,
                name: data.name
            };
        }

        try {
            setLoading(true);
            const response = await createGroup(payload);
            // console.log(response.data)
            if (response.status === 201) {
                dispatch(toggleModal(false));
                dispatch(handleAddGroup(response.data?.group));
                if(response?.data?.user) {
                    dispatch(handleAddUser(response?.data?.user))
                }
                reset();
            }
        } catch (error: any) {
            console.log("Create group failed:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (isModalOpen) {
            modalRef.current?.open();
        } else {
            modalRef.current?.close?.();
        }
    }, [isModalOpen]);

    return (
        <BottomSheetModal
            ref={modalRef}
            title="Add new party"
            onClose={() => dispatch(toggleModal(false))}
        >
            <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        placeholder="Party Name"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.name?.message}
                    />
                )}
            />

            <Select
                options={[
                    { label: "Add Admin", value: "add_admin" },
                    ...(users
                        ?.filter(admin => admin?.role !== 'member')
                        .map((admin) => ({
                            label: admin?.fullname,
                            value: admin?._id,
                            disabled: admin?.belongsto !== ''
                        })) || []),
                ]}
                value={selectedValue}
                onSelect={(val) => {
                    setSelectedValue(val);
                    setValue("selectedValue", val);
                }}
                placeholder="Choose Admin"
            />


            {selectedValue === "add_admin" && (
                <View style={{ gap: 16 }}>
                    <Controller
                        control={control}
                        name="fullname"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                placeholder="Full Name"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.fullname?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="userid"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                placeholder="Enter ITS number"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.userid?.message}
                                keyboardType="number-pad"
                                maxLength={8}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="phone"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                placeholder="Phone Number"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.phone?.message}
                                keyboardType="number-pad"
                                maxLength={10}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="address"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                placeholder="Address"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.address?.message}
                            />
                        )}
                    />
                </View>
            )}
            <Button disabled={loading} full onPress={handleSubmit(onSubmit)}>
                {loading ? "Adding..." : "Add"}
            </Button>
        </BottomSheetModal>
    );
};

export default AddPartyModal;
