import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/src/redux/store";
import { toggleModal } from "@/src/redux/slices/AddPartySlice";
import { useEffect, useRef, useState } from "react";
import { AddDataModalRef } from "@/src/types";
import BottomSheetModal from "./modals/BottomSheetModal";
import Input from "./Input";
import Select from "./Select";
import { View } from "moti";

const AddPartyModal = () => {
    const dispatch = useDispatch();
    const modalRef = useRef<AddDataModalRef>(null);
    const { isModalOpen } = useSelector((state: RootState) => state.modal);
    const [selectedValue, setSelectedValue] = useState<string>("");

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
            footer="Add"
            onClose={() => dispatch(toggleModal(false))}
        >
            <Input placeholder='Party Name' />

            <Select
                options={[
                    { label: "Add Admin", value: "add_admin" },
                    { label: "Aliasger", value: "h_member" },
                    { label: "Jafarussadiq", value: "h_admin" },
                    { label: "Hussain", value: "m_member", disabled: true },
                ]}
                value={selectedValue}
                onSelect={(val) => setSelectedValue(val)}
                placeholder="Choose Admin"
            />

            {selectedValue === "add_admin" && (
                <View style={{ gap: 16 }}>
                    <Input placeholder="Full Name" />
                    <Input placeholder="ITS number" />
                    <Input placeholder="Phone Number" />
                    <Input placeholder="Address" />
                </View>
            )}
        </BottomSheetModal>
    );
};

export default AddPartyModal;
