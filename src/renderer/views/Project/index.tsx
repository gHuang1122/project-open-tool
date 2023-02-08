import PageComp from '@r/components/PageComp';
import { ProList } from '@ant-design/pro-components';
import { Button, Col, Form, message, Row, Select, Tag, Tooltip } from 'antd';
import MyTag from '@/renderer/components/MyTag';
import ProjectApi from '@/service/projectApi';
import { useEffect, useMemo, useState } from 'react';
import ProjectForm from './ProjectForm';
import { ProjectType } from '@/Types/projectType';
import styles from './style.module.less';
import workSpaceApi from '@/service/workSpaceApi';

type OptionType = {
  label: string;
  value: string;
};

const Project = () => {
  const [visiable, setVisiable] = useState(false);
  const [dataSource, setDataSource] = useState<ProjectType[]>([]);
  const [workCachePath, setWorkCachePath] = useState('');
  const [options, setOptions] = useState<OptionType[]>([]);

  const queryWorkSpace = async () => {
    const { data = [] } = await workSpaceApi.getList();
    const arr = data.map((item) => ({
      label: item.name,
      value: item.workCachePath,
    }));
    setOptions(arr);
  };

  const queryList = async () => {
    try {
      if (workCachePath) {
        const { data } = await ProjectApi.getList(workCachePath);
        setDataSource(data);
      }
    } catch (error) {
      message.error(error + '');
    }
  };

  const delAll = async () => {
    try {
      await ProjectApi.clear(workCachePath);
      message.success('删除成功');
      queryList();
    } catch (error) {
      message.error(error + '');
    }
  };

  const handleAdd = () => {
    setVisiable(true);
  };

  const handleOpenDir = async (path: string) => {
    await ProjectApi.openDir(path);
  };

  const handleOpenVscode = async (path: string) => {
    try {
      await ProjectApi.openVscode(path);
    } catch (error) {
      message.error(error + '');
    }
  };

  const list = useMemo(() => {
    return dataSource.map((item) => ({
      title: item?.zname,
      subTitle: <MyTag type={item?.type} />,
      actions: [
        <a
          key="run"
          onClick={() => {
            handleOpenVscode(item.path);
          }}
        >
          vocde打开
        </a>,
        <a
          key="delete"
          onClick={() => {
            handleOpenDir(item.path);
          }}
        >
          打开文件夹
        </a>,
      ],
      content: (
        <Row gutter={[0, 6]}>
          <Col span={24}>
            <Tooltip title={item.name}>
              <div className={styles.text}>工程：{item.name}</div>
            </Tooltip>
          </Col>
          <Col span={24}>
            <Tooltip title={item.path}>
              <div className={styles.text}>路径：{item.path}</div>
            </Tooltip>
          </Col>
        </Row>
      ),
    }));
  }, [dataSource]);

  useEffect(() => {
    if (workCachePath) {
      queryList();
    }
  }, [workCachePath]);

  useEffect(() => {
    queryWorkSpace();
  }, []);

  return (
    <PageComp>
      <Select
        placeholder="查询工作区"
        options={options}
        onChange={(value) => {
          setWorkCachePath(value);
        }}
        allowClear
        style={{ width: 160 }}
      />
      <ProList
        dataSource={list}
        showActions="hover"
        // rowSelection={{}}
        toolBarRender={() => [
          <Button key="refresh" type="primary" onClick={queryList}>
            刷新
          </Button>,
          <Button key="delAll" type="primary" onClick={delAll}>
            全部删除
          </Button>,
          <Button key="create" type="primary" onClick={handleAdd}>
            读取工作区
          </Button>,
        ]}
        grid={{ gutter: 16, column: 3 }}
        metas={{
          title: {},
          subTitle: {},
          content: {},
          actions: {
            cardActionProps: 'actions',
          },
        }}
      ></ProList>

      {visiable && (
        <ProjectForm
          saveCallBack={(path: string) => {
            queryList();
            setVisiable(false);
          }}
          visiable={visiable}
          setVisiable={setVisiable}
        />
      )}
    </PageComp>
  );
};

export default Project;