import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import {
  Card,
  theme,
  h1,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ApartmentOutlined,
  FolderAddOutlined,
  FileAddOutlined,
  FolderOutlined,
  UploadOutlined,
  FileOutlined,
} from '@ant-design/icons';
import React, { useState, ChangeEvent, useEffect } from 'react';
import {
  getProjectView,
  addFolder,
  getDocuments,
  getUploadAction,
  addDocument,
  getGoogleId,
} from '@/services/garantx/view';
import { getAuthHeader } from '@/services/garantx/api';
import { history } from 'umi';
import { Space, Table, Tag } from 'antd';
import type { UploadProps } from 'antd';

const { Column, ColumnGroup } = Table;

const FormItem = Form.Item;

type FolderType = {
  id?: string;
  name?: string;
};
type FolderEditProps = {
  isModalOpen?: boolean;
  handleOk?: (obj: any) => void;
  handleCancel?: () => void;
  data?: FolderType;
};

const FolderEdit: React.FC<FolderEditProps> = ({ isModalOpen, handleOk, handleCancel, data }) => {
  const [state, setState] = useState({ value: data.name });

  const handleChange = (event: ChangeEvent<{ value: string }>) => {
    setState({ value: event?.currentTarget?.value });
  };
  const onSave = () => {
    handleOk({ id: data.id, name: state?.value });
  };
  useEffect(() => {
    setState({ value: data.name });
  }, [data]);

  return (
    <>
      <Modal
        title="Папка"
        open={isModalOpen}
        onOk={onSave}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Отмена
          </Button>,
          <Button key="submit" type="primary" onClick={onSave}>
            Сохранить
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <FormItem label="Наименование" required>
            <Input
              type="text"
              placeholder="Введите название папки"
              onChange={handleChange}
              value={state?.value}
              disabled={false}
            />
          </FormItem>
        </Form>
      </Modal>
    </>
  );
};

const DocumentUpload: React.FC<FolderEditProps> = ({
  isModalOpen,
  handleOk,
  handleCancel,
  data,
}) => {
  const [state, setState] = useState({ value: '' });
  const [sourceId, setSourceId] = useState(null);
  const [fileName, setFileName] = useState(null);

  const handleChange = (event: ChangeEvent<{ value: string }>) => {
    setState({ value: event?.currentTarget?.value });
  };
  const onSave = () => {
    handleOk({ source_id: sourceId, name: fileName });
  };
  /*
 useEffect( () => {
 }, [])
*/

  const props: UploadProps = {
    name: 'file',
    action: getUploadAction(),
    maxCount: 1,
    headers: {
      authorization: getAuthHeader(),
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        console.log('my info', info.file.response.data.source.id);
        setSourceId(info.file.response.data.source.id);
        setFileName(info.file.name);
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <>
      <Modal
        title="Загрузить документ"
        open={isModalOpen}
        onOk={onSave}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Отмена
          </Button>,
          <Button key="submit" type="primary" onClick={onSave}>
            Сохранить
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Upload {...props}>
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form>
      </Modal>
    </>
  );
};

/**
 * @param param0
 * @returns
 */

const Documents: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editData, setEditData] = useState({ id: '', name: '' });
  const [listViewDocuments, setViewDocuments] = useState([{ id: '0000000', name: '/' }]);
  const { location } = history;
  const [projectId, setProjectId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [folderData, setFolderData] = useState({ id: '', name: '' });
  const [viewFolderId, setViewFolderId] = useState(null);

  const [columns, setColumns] = useState([
    {
      title: 'Наименование',
      key: 'name',
      render: (_, record) => {
        return (
          <>
            {record.folder_id && (
              <Space onClick={(e) => selectFolder(record.folder_id)}>
                <FolderOutlined />
                {record.name_folder}
              </Space>
            )}
            {record.document_id && (
              <Space onClick={(e) => viewDocument(record.document_id)}>
                <FileOutlined />
                {record.name_document}
              </Space>
            )}
          </>
        );
      },
    },
    {
      title: 'Действия',
      key: 'operation',
      render: (_, record) => {
        return (
          <Space size="middle">
            <Popconfirm
              title="Удалить"
              description="Вы уверены, что хотите удалить элемент?"
              onConfirm={(e) => onDelete(record.id)}
              okText="Да"
              cancelText="Нет"
            >
              <DeleteOutlined title="Удалить" />
            </Popconfirm>
          </Space>
        );
      },
    },
  ]);

  const selectFolder = (folderID) => {
    setViewFolderId(folderID);
    //refreshData();
  };
  const viewGoogleDoc = async (document_id) => {
    const googleId = await getGoogleId(document_id);
    const docRef = `https://docs.google.com/document/d/${googleId}/edit`;
    window.location.assign(docRef);
  };

  const viewDocument = (document_id) => {
    viewGoogleDoc(document_id);
    //refreshData();
  };

  const addNewProject = () => {
    setEditData({ id: '', name: '' });
    showModal();
  };
  const editProject = (project) => {
    setEditData(project);
  };
  const delProject = async (id: string) => {
    //    await deleteProject(id);
    //    await refreshData();
  };

  const onDelete = (id) => {
    delProject(id);
    alert('удаление');
  };
  const onAddNewFolder = () => {
    setFolderData({ id: '', name: '' });
    showModal();
  };
  const onAddNewDocument = () => {
    showUploadModal();
  };
  const showModal = () => {
    setIsModalOpen(true);
  };
  const showUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const saveData = async (obj: any) => {
    console.log('saveData');
    const folder = await addFolder(viewId, viewFolderId, obj.name);
    console.log('saveData after', folder);
    await refreshData();
    setIsModalOpen(false);
  };

  const handleOk = (obj: any) => {
    saveData(obj);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const getExtByName = (name) => {
    const arr = name.split(`.`);
    if (arr.length > 0) return arr[arr.length - 1];
    return 'undefined';
  };
  const saveDocument = async (obj: any) => {
    setIsUploadModalOpen(false);
    await addDocument(viewId, viewFolderId, obj.name, getExtByName(obj.name), obj.source_id);
    await refreshData();
  };
  const handleUploadOk = (obj: any) => {
    saveDocument(obj);
  };

  const handleUploadCancel = () => {
    setIsUploadModalOpen(false);
  };

  const refreshData = async () => {
    let view_id = viewId;
    if (viewId == null) {
      const views = await getProjectView(getProjectId());
      view_id = views[0].id;
      setViewId(view_id);
    }
    setViewDocuments(await getDocuments(view_id, viewFolderId));
    //   const listData = await getProjects();
    //    setListProjects(listData);
  };

  const getProjectId = () => {
    let id = projectId;
    if (id === null) {
      const arrPath = location.pathname.split(`/`);
      if (arrPath.length >= 3) {
        id = arrPath[2];
        setProjectId(id);
      }
    }

    return id;
  };
  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    refreshData();
  }, [viewFolderId]);

  return (
    <PageContainer>
      <Button variant="primary" onClick={onAddNewFolder}>
        <Space>
          <FolderAddOutlined />
        </Space>
      </Button>
      <Button variant="primary" onClick={onAddNewDocument}>
        <Space>
          <FileAddOutlined />
        </Space>
      </Button>
      <Table columns={columns} dataSource={listViewDocuments} rowKey={(record) => record.id} />
      <FolderEdit
        isModalOpen={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        data={folderData}
      />
      <DocumentUpload
        isModalOpen={isUploadModalOpen}
        handleOk={handleUploadOk}
        handleCancel={handleUploadCancel}
      />
    </PageContainer>
  );
  /*
  return (
    <PageContainer>
    </PageContainer>
  );
*/
};

export default Documents;
