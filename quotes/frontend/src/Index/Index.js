import React, { Component } from 'react';
import { Button, Table } from 'react-bootstrap';
import axios from 'axios';
import "./css/index.css";
import LoadingComponent from './LoadingComponent';
import PopUp from './PopUp';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

toast.configure()


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cryptocurrencies: null,
      selectCryptocurrencies: [],
      quotes: null,
      format: "CSV",
      fileName: null,
      placeholder: null,
      popUpAction: "",
      showPopup: false
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeFormat = this.handleChangeFormat.bind(this);
    this.getCryptocurrencies();
  }

  hidePopup(e){
    e.preventDefault()

    this.setState({
        showPopup: false,
        placeholder: null,
        popUpAction: ""
    })
  }

  handleChange(event) {
    const name = event.target.name;
    let options = event.target.options;
    let value = []

    for (var i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        let opt = options[i].value.split("/")[0]
        value.push(opt);
      }
    }

    this.setState(prevstate => {
      const newState = { ...prevstate };
      newState[name] = value;
      newState["fileName"] = null;
      return newState;
    });
  }

  handleChangeFormat(event) {
    const name = event.target.name;
    const value = event.target.value;
    this.setState(prevstate => {
      const newState = { ...prevstate };
      newState[name] = value;
      newState["fileName"] = null;
      return newState;
    });
  }

  getCryptocurrencies() {
    const url = "http://127.0.0.1:8000/get_cryptocurrencies/";
    axios.get(url)
      .then(response => {
        this.setState({
          cryptocurrencies: response.data[0]
        });
      }, error => {
        console.log(error);
      })
  }

  getQuotes(e) {
    e.preventDefault();
    this.setState({
      showPopup: true,
      popUpAction: "loading",
      placeholder: "????????????????"
    });
    const url = "http://127.0.0.1:8000/get_quotes/";
    const cryptocurrencies = this.state.cryptocurrencies;
    let data = [];
    for (let i = 0; i < this.state.selectCryptocurrencies.length; i++) {
      let num = Number(this.state.selectCryptocurrencies[i]);
      data.push([cryptocurrencies[num][0], cryptocurrencies[num][1]]);
    }
    axios.post(url, { cryptocurrencies: data })
      .then(response => {
        this.setState({
          quotes: response.data,
          showPopup: false,
          popUpAction: "",
          placeholder: ""
        });
      }, error => {
        this.setState({
          popUpAction: "error",
          placeholder: "??????-???? ?????????? ???? ??????("
        });
      })
  }

  exportTo(e) {
    e.preventDefault();
    let data = {
      format: this.state.format,
      data: this.state.quotes
    }
    this.setState({
      fileName: null,
      showPopup: true,
      popUpAction: "loading",
      placeholder: "???????????????????????? ?????????????? ?? ????????"
    });
    const url = "http://127.0.0.1:8000/export/";
    axios.post(url, data)
      .then(response => {
        toast.success("?????????????? ????????????????????????????!", { position: "bottom-right", autoClose: 4000, hideProgressBar: true });
        this.setState({
          fileName: response.data.file,
          showPopup: false,
          popUpAction: "",
          placeholder: ""
        });
      }, error => {
        this.setState({
          popUpAction: "error",
          placeholder: "??????-???? ?????????? ???? ??????("
        });
      })
  }

  genTable() {
    const quotes = this.state.quotes;
    return (
      <>
        <div id="table_div" style={{ paddingTop: "20px" }}>
          <Table bordered>
            <thead>
              <tr>
                <th>?????? ????????????</th>
                <th>???????????????? ????????????</th>
                <th>????????</th>
                <th>???????? ??????????????????</th>
                <th>??????????????</th>
              </tr>
            </thead>
            <tbody>
              {
                quotes.map((row, index) => (
                  <tr key={'row_' + index}>
                    <td>{row.symbol}</td>
                    <td>{row.name}</td>
                    <td>{row.price}</td>
                    <td>{row.date}</td>
                    <td>{row.nom}</td>
                  </tr>
                ))
              }
            </tbody>
          </Table>
        </div>
        <div className='export-div'>
          <p style={{ paddingRight: "20px" }}>???????????????????????????? ??:</p>
          <select style={{ height: "30px" }} value={this.state.format} onChange={this.handleChangeFormat} name="format">
            <option value={'CSV'}>CSV</option>
            <option value={'XLSX'}>XLSX</option>
            <option value={'PDF'}>PDF</option>
          </select>
        </div>
        <div className='button-div'>
          <Button onClick={e => this.exportTo(e)}>????????????????????????????</Button>
        </div>
        <div className='button-div' style={{ marginBottom: "40px" }}>
          {
            this.state.fileName ?
              <a href={'http://127.0.0.1:8000/' + this.state.fileName} download>
                <Button>??????????????</Button>
              </a>
              : null
          }
        </div>
      </>
    )
  }

  render() {
    return (
      <>
        <h2 className="header">?????????????????? ??????????????????????</h2>
        {
          this.state.cryptocurrencies ?
            <>
              <div className="choice-currencies-div center">
                <div className="choice-currencies-label">???????????????? ???????? ?????? ?????????????????? ??????????:</div>
                <select name="selectCryptocurrencies" value={this.state.selectCryptocurrencies}
                  multiple={true} onChange={this.handleChange} className="select-cryptocurrencies">
                  {
                    Object.keys(this.state.cryptocurrencies).map(id => (
                      <option key={"option_" + id}
                        value={id}>
                        {this.state.cryptocurrencies[id][0] + "/USD"}
                      </option>
                    ))
                  }
                </select>
              </div>
              <div className='button-div'>
                <Button onClick={e => this.getQuotes(e)}
                  disabled={this.state.selectCryptocurrencies.length === 0 ? true : false}
                >
                  {this.state.selectCryptocurrencies.length > 1 ? "???????????????? ??????????????????" : "???????????????? ??????????????????"}
                </Button>
              </div>
              {
                this.state.quotes ?
                  this.genTable()
                  : null
              }
            </> : <LoadingComponent loadingWord={"????????????????"} />
        }
        {
          this.state.showPopup ?
            <PopUp
              placeholder={this.state.placeholder}
              hidePopUp={this.hidePopup.bind(this)}
              popUpAction={this.state.popUpAction}
            />
            : null
        }
      </>
    );
  }
}

export default (App);