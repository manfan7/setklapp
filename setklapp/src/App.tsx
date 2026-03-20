
import {ConfigProvider} from 'antd';
import ruRU from 'antd/locale/ru_RU';
import {DataTable} from './components/DataTable';
import './App.css';

const App = () => {
  return (
      <ConfigProvider locale={ruRU}>
        <div className="App">
          <h1 style={{ textAlign: 'center', marginTop: '20px', marginBottom: '0' }}>
             Таблица  данными
          </h1>
          <DataTable />
        </div>
      </ConfigProvider>
  );
};

export default App;