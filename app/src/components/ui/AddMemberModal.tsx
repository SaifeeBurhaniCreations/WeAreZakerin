import React, { useImperativeHandle, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/src/redux/store';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import userSchema, { UserFormData } from '@/src/schemas/UserSchema';
import { addMemberInGroup } from '@/src/service/GroupService';
import { createUser } from '@/src/service/UserService';
import { Toast } from '@/src/utils/Toast';
import { handleAddMemberInGroup } from '@/src/redux/slices/AddPartySlice';
import { handleAddUser, handleAddUserInParty } from '@/src/redux/slices/UserSlice';
import { AddDataModalRef } from '@/src/types';
import BottomSheetModal from './modals/BottomSheetModal';
import Select from './Select';
import Input from './Input';
import Switch from './Switch';
import { normalizeString } from '@/src/utils/common';

interface AddMemberModalProps {
    name: string;
    groupId: string;
}

const AddMemberModal = React.forwardRef<AddDataModalRef, AddMemberModalProps>(({ name, groupId }, ref) => {
    const dispatch = useDispatch();
    const modalRef = useRef<AddDataModalRef>(null);
    const [loading, setLoading] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string>('');

    const { users } = useSelector((state: RootState) => state.users);

    useImperativeHandle(ref, () => ({
        open: () => modalRef.current?.open(),
        close: () => modalRef.current?.close(),
    }));

    const {
        control,
        handleSubmit: handleAddMemberSubmit,
        formState: { errors },
        reset: resetAddMember,
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        mode: 'onChange',
        defaultValues: {
            selectedValue: '',
            userid: '',
            title: '',
            fullname: '',
            phone: '',
            address: '',
            belongsto: name,
            role: 'member',
        },
    });

    const handleAddMember: SubmitHandler<UserFormData> = async (data) => {
        try {
            setLoading(true);
            if (data.selectedValue !== 'add_member') {
                const response = await addMemberInGroup({ memberId: data.selectedValue!, groupId: groupId! });
                if (response.status === 200) {
                    Toast.show({
                        title: 'Added',
                        description: 'User added successfully!',
                        variant: 'success',
                    });
                    const userPayload = users?.find(user => user._id === data.selectedValue);
                    if (userPayload) {
                        dispatch(handleAddMemberInGroup({ name: normalizeString(name), user: userPayload }));
                    }
                    dispatch(handleAddUserInParty({ name: normalizeString(name)!, user: data.selectedValue! }));
                    modalRef.current?.close();
                    resetAddMember();
                }
            } else {
                const response = await createUser(data);
                
                if (response.status === 201) {
                    const newUser = response.data?.user;
                    Toast.show({
                        title: 'Added',
                        description: 'User added successfully!',
                        variant: 'success',
                    });
                    dispatch(handleAddUser(newUser));
                    dispatch(handleAddMemberInGroup({ name: normalizeString(name), user: newUser }));
                    modalRef.current?.close();
                    resetAddMember();
                }
            }
        } catch (error: any) {
            Toast.show({ title: 'Error', description: error.message, variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const selectOptions = users
        ? [
            { label: 'Add Member', value: 'add_member' },
            ...users
                .filter(admin => !admin.belongsto)
                .map(admin => ({
                    label: admin.fullname,
                    value: admin._id,
                })),
        ]
        : [{ label: 'Add Member', value: 'add_member' }];

    return (
        <BottomSheetModal
            title={'Add new member'}
            ref={modalRef}
            footer={loading ? 'Adding...' : 'Add'}
            onPress={handleAddMemberSubmit(handleAddMember)}
            // footerButtonProps={{ disabled: loading }}
        >
            <Controller
                control={control}
                name="selectedValue"
                render={({ field: { onChange, value } }) => (
                    <Select
                        options={selectOptions}
                        value={value}
                        onSelect={(val) => {
                            setSelectedValue(val);
                            onChange(val);
                        }}
                        placeholder="Choose Member"
                    />
                )}
            />

            {selectedValue === 'add_member' && (
                <>
                    <Controller
                        control={control}
                        name="fullname"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                placeholder="Full name"
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
                        name="title"
                        render={({ field: { onChange, value } }) => (
                            <Select
                                options={[
                                    { label: 'Tipper', value: 'tipper' },
                                    { label: 'Support', value: 'support' },
                                    { label: 'Peaker', value: 'peaker' },
                                    { label: 'Closer', value: 'closer', disabled: true },
                                ]}
                                value={value}
                                onSelect={onChange}
                                placeholder="Choose Title"
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
                    <Controller
                        control={control}
                        name="role"
                        render={({ field: { onChange, value } }) => (
                            <Switch
                                text={'Admin'}
                                value={value === 'groupAdmin'}
                                onValueChange={(val) => onChange(val ? 'groupadmin' : 'member')}
                            />
                        )}
                    />
                </>
            )}
        </BottomSheetModal>
    );
});

export default AddMemberModal;