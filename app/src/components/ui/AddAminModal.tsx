import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/src/redux/store";
import { useEffect, useRef } from "react";
import { AddDataModalRef } from "@/src/types";
import BottomSheetModal from "./modals/BottomSheetModal";
import Input from "./Input";
import { toggleAdminModal } from "@/src/redux/slices/AddAdminSlice";

const AddAminModal = () => {
    const dispatch = useDispatch();
    const modalRef = useRef<AddDataModalRef>(null);
    const { isAdminModalOpen } = useSelector((state: RootState) => state.adminModal);

    useEffect(() => {
        if (isAdminModalOpen) {
            modalRef.current?.open();
        } else {
            modalRef.current?.close?.();
        }
    }, [isAdminModalOpen]);

    return (
        <BottomSheetModal
            ref={modalRef}
            title="Add new Admin"
            footer="Add"
            onClose={() => dispatch(toggleAdminModal(false))}
        >
              <Input placeholder='Full name' />
                <Input placeholder='ITS number' />
                <Input placeholder="Phone Number" />
                <Input placeholder="Email" />
                <Input placeholder="Address" />
        </BottomSheetModal>
    );
};

export default AddAminModal;
