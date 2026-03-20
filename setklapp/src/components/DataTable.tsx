import { useMemo, useState, useCallback, useRef } from 'react';
import { Button, DatePicker, Form, Input, InputNumber, message, Modal, Space, Table, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useDebounce } from "../utils/useDebounce.ts";

interface DataRow {
    id: string;
    name: string;
    date: string;
    value: number;
}

export const DataTable = () => {
    const [data, setData] = useState<DataRow[]>([
        {
            id: '1',
            name: 'Иван Петров',
            date: '2024-01-15',
            value: 1500,
        },
        {
            id: '2',
            name: 'Мария Иванова',
            date: '2024-02-20',
            value: 2300,
        },
        {
            id: '3',
            name: 'Алексей Смирнов',
            date: '2024-03-10',
            value: 980,
        },
    ]);

    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();
    const isOpeningRef = useRef(false); // Флаг для предотвращения повторного открытия

    const debouncedSearchText = useDebounce(searchText, 300);

    const filteredData = useMemo(() => {
        if (!debouncedSearchText.trim()) return data;
        const searchLower = debouncedSearchText.toLowerCase();
        return data.filter(item =>
            Object.values(item).some(value =>
                String(value).toLowerCase().includes(searchLower)
            )
        );
    }, [data, debouncedSearchText]);

    const generateId = (): string => {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    };

    const closeModal = useCallback(() => {
        setModalVisible(false);
        isOpeningRef.current = false;
        setTimeout(() => {
            form.resetFields();
            setEditingId(null);
        }, 200);
    }, [form]);

    const handleAdd = useCallback(() => {
        if (isOpeningRef.current || modalVisible) return;

        isOpeningRef.current = true;
        setEditingId(null);
        form.resetFields();
        setModalVisible(true);

        setTimeout(() => {
            isOpeningRef.current = false;
        }, 300);
    }, [form, modalVisible]);

    const handleEdit = useCallback((record: DataRow) => {
        if (isOpeningRef.current || modalVisible) return;

        isOpeningRef.current = true;
        setEditingId(record.id);
        form.setFieldsValue({
            name: record.name,
            date: dayjs(record.date),
            value: record.value,
        });
        setModalVisible(true);

        setTimeout(() => {
            isOpeningRef.current = false;
        }, 300);
    }, [form, modalVisible]);

    const handleDelete = useCallback((id: string) => {
        Modal.confirm({
            title: 'Подтверждение удаления',
            content: 'Вы уверены, что хотите удалить эту запись?',
            okText: 'Да',
            cancelText: 'Нет',
            onOk: () => {
                setData(prevData => prevData.filter(item => item.id !== id));
                message.success('Запись успешно удалена');
            },
        });
    }, []);

    const handleSave = useCallback(async () => {
        try {
            const values = await form.validateFields();
            const formattedDate = values.date.format('YYYY-MM-DD');

            if (editingId) {
                setData(prevData =>
                    prevData.map(item =>
                        item.id === editingId
                            ? {
                                ...item,
                                name: values.name,
                                date: formattedDate,
                                value: values.value,
                            }
                            : item
                    )
                );
                message.success('Запись успешно обновлена');
            } else {
                const newRow: DataRow = {
                    id: generateId(),
                    name: values.name,
                    date: formattedDate,
                    value: values.value,
                };
                setData(prevData => [...prevData, newRow]);
                message.success('Запись успешно добавлена');
            }

            closeModal();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    }, [editingId, form, generateId, closeModal]);

    const columns: ColumnsType<DataRow> = useMemo(() => [
        {
            title: 'Имя',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name, 'ru'),
            sortDirections: ['ascend', 'descend'],
            width: '30%',
        },
        {
            title: 'Дата',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            sortDirections: ['ascend', 'descend'],
            width: '25%',
            render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
        },
        {
            title: 'Значение',
            dataIndex: 'value',
            key: 'value',
            sorter: (a, b) => a.value - b.value,
            sortDirections: ['ascend', 'descend'],
            width: '25%',
            render: (value: number) => value.toLocaleString('ru-RU'),
        },
        {
            title: 'Действия',
            key: 'actions',
            width: '20%',
            render: (_: any, record: DataRow) => (
                <Space size="middle">
                    <Tooltip title="Редактировать">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Удалить">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id)}
                            size="small"
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ], [handleEdit, handleDelete]);

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    size="large"
                >
                    Добавить
                </Button>

                <Input
                    placeholder="Поиск по всем полям..."
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: '300px' }}
                    size="large"
                    allowClear
                />
            </div>

            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} из ${total} записей`,
                }}
                bordered
                style={{ background: '#fff' }}
            />

            <Modal
                title={editingId ? 'Редактирование записи' : 'Добавление записи'}
                open={modalVisible}
                onOk={handleSave}
                onCancel={closeModal}
                okText="Сохранить"
                cancelText="Отмена"
                width={500}
                destroyOnClose
                maskClosable={false}
                keyboard={true}
                transitionName=""
                maskTransitionName=""
                getContainer={false}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        name: '',
                        date: dayjs(),
                        value: 0,
                    }}
                >
                    <Form.Item
                        name="name"
                        label="Имя"
                        rules={[
                            { required: true, message: 'Пожалуйста, введите имя' },
                            { min: 2, message: 'Имя должно содержать минимум 2 символа' },
                            { max: 100, message: 'Имя не должно превышать 100 символов' },
                        ]}
                    >
                        <Input placeholder="Введите имя" />
                    </Form.Item>

                    <Form.Item
                        name="date"
                        label="Дата"
                        rules={[{ required: true, message: 'Пожалуйста, выберите дату' }]}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            format="DD.MM.YYYY"
                            placeholder="Выберите дату"
                        />
                    </Form.Item>

                    <Form.Item
                        name="value"
                        label="Числовое значение"
                        rules={[
                            { required: true, message: 'Пожалуйста, введите значение' },
                            { type: 'number', min: 0, message: 'Значение должно быть положительным числом' },
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Введите числовое значение"
                            min={0}
                            step={100}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};