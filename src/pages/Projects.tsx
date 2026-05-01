import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Card, theme, h1, Row, Col, Button, Modal, Form, Input, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined } from '@ant-design/icons';
import React, { useState, ChangeEvent, useEffect } from 'react';
import { getProjects, saveProject, deleteProject } from '@/services/garantx/project';
import { history } from 'umi';

const FormItem = Form.Item;

/**
 * @param param0
 * @returns
 */

type ProjectType = {
  id?: string;
  name?: string;
};
type ProjectEditProps = {
  isModalOpen?: boolean;
  handleOk?: (obj: any) => void;
  handleCancel?: () => void;
  data?: ProjectType;
};

const ProjectEdit: React.FC<ProjectEditProps> = ({ isModalOpen, handleOk, handleCancel, data }) => {
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
        title="Проект"
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
              placeholder="Введите название проекта"
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

const Projects: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState({ id: '', name: '' });
  const [listProjects, setListProjects] = useState([]);

  const addNewProject = () => {
    setEditData({ id: '', name: '' });
    showModal();
  };
  const editProject = (project) => {
    setEditData(project);
    showModal();
  };
  const delProject = async (id: string) => {
    await deleteProject(id);
    await refreshData();
  };

  const onDelProject = (id) => {
    delProject(id);
  };

  const OnSaveProject = () => {
    alert(`on save`);
  };
  const showModal = () => {
    setIsModalOpen(true);
  };

  const saveData = async (obj: any) => {
    console.log('saveData');
    await saveProject(obj);
    console.log('saveData after');
    await refreshData();
    setIsModalOpen(false);
  };

  const handleOk = (obj: any) => {
    saveData(obj);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const refreshData = async () => {
    const listData = await getProjects();
    console.log('listData', listData);
    setListProjects(listData);
  };

  useEffect(() => {
    console.log('useeffect');
    refreshData();
  }, []);

  const goToDocuments = (id) => {
    history.push(`/documents/${id}`);
  };

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card
            bordered={false}
            style={{ width: 200, height: 100 }}
            hoverable={true}
            onClick={() => {
              addNewProject();
            }}
          >
            <Row style={{ height: 50, background: 'White', justifyContent: 'center' }}>
              <Col>
                <PlusOutlined style={{ fontSize: '50px' }} />
              </Col>
            </Row>
          </Card>
        </Col>
        {listProjects.map((project, i) => {
          return (
            <Col key={project.id} span={6}>
              <Card bordered={false} style={{ width: 200, height: 100 }} hoverable={true}>
                <p
                  align="center"
                  onClick={() => {
                    goToDocuments(project.id);
                  }}
                >
                  {project.name}
                </p>
                <p align="right">
                  <ApartmentOutlined />
                  <EditOutlined
                    onClick={() => {
                      editProject(project);
                    }}
                  />
                  <Popconfirm
                    title="Удалить проект"
                    description="Вы уверены, что хотите удалить проект?"
                    onConfirm={() => onDelProject(project.id)}
                    okText="Да"
                    cancelText="Нет"
                  >
                    <DeleteOutlined />
                  </Popconfirm>
                </p>
              </Card>
            </Col>
          );
        })}
      </Row>
      <ProjectEdit
        isModalOpen={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        data={editData}
      />
    </PageContainer>
  );
};

export default Projects;
