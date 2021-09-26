import React, { Fragment, useState,ChangeEvent } from "react";
import {withStyles, Theme, createStyles, makeStyles} from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import axios from "axios";
import Moment from "moment";
import { connect } from 'react-redux';
import { AppState } from 'types/index';
import momentLocalizer from 'react-widgets-moment';
import { DateComponent,SelectComponent, StringTranslator, translateString, isNullOrUndefined,ReactTableComponent} from 'components/HelperMethods/ReusableComponents';
import 'react-widgets/dist/css/react-widgets.css';
import { Paper,Box,Typography,AppBar,Toolbar,IconButton,Button,Tabs,Tab,Table,TableRow,TableHead,TableContainer,TableBody,TableCell,Collapse,Grid} from "@material-ui/core";
import ArrowBackIosOutlinedIcon from '@material-ui/icons/ArrowBackIosOutlined';
import ArrowForwardIosOutlinedIcon from '@material-ui/icons/ArrowForwardIosOutlined';
import { LinkTitle } from 'components/LinkTitle';
import { logMessages, errorLogMessages } from 'components/ProductionForAction/LogMessages';
import uniqBy from 'lodash/uniqBy';
import uuidv4 from 'uuid';
import { DateTimePicker } from "react-widgets";
import "react-table/react-table.css";
import {FiDollarSign} from 'react-icons/fi'


let socket: any;
    //Styling Tabs on click

  
const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),  
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  }));
  const activeTab = {
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    fontWeight: 700,
    fontSize: '1em',
}  

const defaultTab = {
    backgroundColor: 'white',
    color: 'var(--primary-color)',
    fontWeight: 700,
    fontSize: '1em',
}


    //Tabs Container component function

interface TabContainerProps {
    children?: React.ReactNode;
}
function TabContainer(props: TabContainerProps) {
    return (
        <Typography component="div"
        // style={{ padding: 8 * 3 }}
        >
            {props.children}
        </Typography>
    );
}

const formatWithIcon = (cell,row) => {
    return(
        <span><FiDollarSign />cell</span>
    )
}
    //React Table Columns data and header

let acctcolumns: any = [{
    id: Math.random(),
    width: 170,
    Header: translateString("GROUP"),
    accessor: "GROUP",
    
    getProps: (state, rowInfo) => {
        if (rowInfo && rowInfo.row) {
          return {
            style: { color: 'var(--transperent-black)',fontWeight: 'bold',backgroundColor: 'rgb(232, 232, 232)' },
          };
        }
        return {};
      },
}, {
    id: Math.random(),
    width: 200,
    Header: "INVENTORY",
    accessor: "INVENTORY",
    Cell: row => (
        <div style={{ color: 'var(--coke-red)',fontWeight: 'bold' }}>-{row.value}$CAD</div>
      ),
}, {
    id: Math.random(),
    width: 220,
    Header: "WORK IN PROGRESS",
    accessor: "WORK_IN_PROGRESS",
    Cell: row => (
        <div style={{color: 'var(--success)',fontWeight: 'bold' }}>+{row.value}$CAD</div>
      ), 
}, {
    id: Math.random(),
    minresWidth: 140,
    Header: "SALES",
    accessor: "SALES",
    Cell: row => (
        <div style={{color: 'var(--success)',fontWeight: 'bold' }}>+{row.value}$CAD</div>
      ), 
    
}, {
    id: Math.random(), 
    minresWidth: 140,
    Header: "VARIANCE",
    accessor: "VARIANCE",
    Cell: row => (
        <div style={{color: 'var(--coke-red)',fontWeight: 'bold' }}>-{row.value}$CAD</div>
      ),
}]


let inventorycolumns: any = [{
    
    id: Math.random(),
    width: 280,
    Header: translateString("PRODUCT"),
    accessor: "PRODUCT",
    getProps: (state, rowInfo) => {
        if (rowInfo && rowInfo.row) {
          return {
            style: { color: 'var(--transperent-black)',fontWeight: 'bold',backgroundColor: 'rgb(232, 232, 232)'  },
          };
        }
        return {};
      },
}, {
    id: Math.random(),
    width: 200,
    Header: translateString("GREENVILLE"),
    accessor: "GREENVILLE",
    Cell: row => (
        <div style={{color: 'var(--success)',fontWeight: 'bold' }}>+{row.value}$CAD</div>
      ), 

}, {
    id: Math.random(),
    width: 200,
    Header: translateString("MONTREAL"),
    accessor: "MONTREAL",
    Cell: row => (
        <div style={{color: 'var(--success)',fontWeight: 'bold' }}>+{row.value}$CAD</div>
      ), 
},

{
    id: Math.random(),
    width: 250,
    Header: translateString("TOTAL"),
    accessor: "Principal",
    Cell: row => (
        <div style={{ color: 'var(--coke-red)',fontWeight: 'bold' }}>-{row.value}$CAD</div>
      ),
}]

Moment.locale('en')
momentLocalizer()
interface ReduxState {
    state: AppState 
}

type Props = ReduxState & RouteComponentProps<{}>;

class AccountTransfer extends React.Component<
   Props,
      {
    //filterAll: string,
    //tableData: Array<any>;
    //filteredTableData: Array<any>,
    //tableColumns: Array<any>;
    data: Array<Response>,
    transfertlist:Array<any>;
    dataTransfert: Array<any>
    dataInventory: Array<any>
    dataSales: Array<any>;
    server: any;
    lineperiod: any;
    tabValue: number;
    transferet: boolean;
    value: any;
    dateValue:null;
    setValue: null;
    dateTime: any;
    startDate: any;
    endDate: any;
    sampleTime : Date;
    lossarray: Array<any>;
    uniqueId: string;
    showundeclared: any;
    currentlyrunning: any;
    lines: Array<any>;
    periodendDate: Date,
    periodiD: number ,
    closePeriod:boolean,
    
      }>{

    constructor(props:any) {
        super(props);
        
        let server = !isNullOrUndefined(localStorage.getItem('servername')) ? localStorage.getItem('servername') : ""
        this.state = {
            data: [],
            transfertlist:[],
            dataSales: [],
            dataInventory: [],
            server: server,
            dataTransfert: [],
            lineperiod: 0,
            tabValue: 0,
            transferet:false,
            value: [],
            dateValue: null,
            setValue: null,
            dateTime: new Date(),
            startDate: new Date(),
            endDate: new Date(),
            sampleTime : new Date(),
            lossarray: new Array(),
            uniqueId: uuidv4(),
            showundeclared: 0,
            currentlyrunning: {},
            lines: new Array(),
            periodendDate: new Date() ,
            periodiD: 0,
            closePeriod: false,
           // tableData: new Array(),
           // filteredTableData: new Array(),
           // tableColumns : new Array(),
            //filterAll: '',
    
           }
        } 

        //Here i call the data for Transfert and Inventory table
    componentDidMount() {
        const { server } = this.state;
        const self=this 
        let data = new Array()
        let datatransfert = new Array()
        let datainventory = []
        /*axios.get(`${server}/api/getacctransfertforget/1`)
            .then(res => {
                //console.log(res.data);
                if (res.data.length > 0) {
                    res.data[0].forEach((a)=> {
                        data.push({
                            group:a.GROUP,
                            inventory:a.INVENTORY, 
                            wip: a.WORK_IN_PROGRESS,
                            sales: a.SALES,
                            variance: a.VARIANCE
                        })
                    })
                    self.setState({transfertlist: res.data[0],data});
                } else {
                    //self.setState({ hasRecord: false }); 
                }
            })
            .catch(err => {
                errorLogMessages(err);
            });*/
            data = [ 
                `${server}/api/getacctransfertforget/${1}`,
                `${server}/api/getacctransfertinvent`
                 ]
                axios.all(data.map(l => axios.get(l)))
                .then(
                    axios.spread(function (...res) {
                        datatransfert= res[0].data[0]
                        datainventory= res[1].data[0]
                        self.setState ({  dataTransfert:datatransfert,dataInventory:datainventory, })
 
                    }) 
                )
              }

          getPeriod = () => {
              console.log( 'getperiodcall')
            const { periodendDate,periodiD,closePeriod } = this.state;
                axios.get(`${this.state.server}/api/getperiodroll?periodendDate=${periodendDate}&periodiD=${periodiD}&closePeriod=${closePeriod}` )
                .then(res =>{ 
                    console.log(res)
                    
                 } ).catch(err => {
                    errorLogMessages(err)})
           
            }
/*
          getPeriod() {
                const { server } = this.state;
                const self=this 
                let dataPeriod = new Array()
                let periodendDate = new Array()
                let periodiD = new Array()
                let closePeriod = []
             
                    dataPeriod = [ 
                        `${server}/api/getacctransfertforget/${1}`,
                        `${server}/api/getacctransfertinvent`
                         ]
                        axios.all(dataPeriod.map(l => axios.get(l)))
                        .then(
                            axios.spread(function (...res) {
                              periodiD= res[0].data[0]
                                periodendDate= res[0].data[0]
                             closePeriod= res[0].data[0]
                  self.setState ({  dataTransfert:datatransfert,dataInventory:datainventory, })
         
                            }) 
                        ) 
                      }
        
*/
           /*   handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
                const { name, value } = event.currentTarget;
                //console.log(name, value)
                this.setState({ ...this.state, [name]: parseInt(value) }, () => {
                    // socket.close();
                    socket.disconnect(true);
                    this.getPeriod();
                });
            }

              /*  handleDateChange(value, name) {
            // console.log(value, name)
            let date: Date = !isNaN(value) ? new Date(value) : new Date();
            let self = this.state
            self[name] = date
            this.setState(self, () => {
                const { lineNumber, shiftNumber } = this.state
                let startDate = Moment(this.state.startDate).format('MM-DD-YYYY');
                let endDate = Moment(this.state.endDate).format("MM-DD-YYYY");
                this.fetchData(startDate, endDate, lineNumber, shiftNumber)
            })
        }*/
 
    //function to redirect to a ExcelDataAnalysis Page

    getDetails = () => {
        this.props.history.push({
            pathname: '/P4A/excelDataAnalysis' 
        })
    }


    render() { 
        let { value,transfertlist,data,tabValue,dataInventory,dataTransfert,dataSales,lineperiod,lines,periodiD,periodendDate } = this.state
console.log(  dataSales)
        return ( 
            <div className="AccPage">
            <div>
               <div id="Account Transfer">
               <LinkTitle/>
                </div >
            <div>
        <Paper elevation={3} className="col-8" style={{borderRadius:'5px'}}>
            <Box>
            <form role="form" ref="form">
                            </form>
                <div style={{paddingLeft:'2em'}} className="d-flex flex-row flex-wrap  font-weight-bold ">
                <h1 style={{textTransform: 'uppercase',fontWeight: 'bolder',paddingTop:'23px',fontSize: '34px'}}>current period</h1>
              <label style={{textTransform: 'uppercase',paddingLeft: '1em',paddingTop:'24px', }} ><StringTranslator><p className="notransfered">not transfered</p></StringTranslator></label> 
              <div style={{paddingTop: '1rem',paddingLeft: '5rem'}} className=" col-6 col-sm-6 col-md-2 col-lg-2 col-xl-2">
                                <SelectComponent name="StopCategory"
                                        options={lines}
                                        value={lineperiod}
                                        enableAll={true}
                                        label="Select Period" />
                            </div>
              </div>
              <h5 style={{paddingLeft:'2em',color:'rgb(156, 156, 156)'}}>From 1st December 2020 To 31st December 2020 </h5>
          </Box>
    
          <Box style={{paddingTop:'2rem',paddingLeft:'27px'}}>
                <div  className="d-flex flex-row flex-wrap  font-weight-bold ">
                <h1 style={{textTransform: 'uppercase',fontWeight: 'bolder',fontSize: '24px',color: 'gray'}}>previous period</h1>
                    <label style={{textTransform: 'uppercase',paddingLeft: '1em' }} onClick={this.getPeriod} ><StringTranslator><p className="transfered">transfered</p></StringTranslator></label> 
                    </div>
                    <h5 style={{color:'rgb(156, 156, 156)',paddingLeft:"6px",paddingBottom: '23px'}}>From 1st November 2020 To 30th November 2020</h5>
            </Box>
          </Paper>
                </div>
                <div>
                  <Paper elevation={3} className="col-8" style={{borderRadius:'5px'}} >
                  <div style={{paddingLeft:'2em'}} className="d-flex flex-row flex-wrap  font-weight-bold ">
                <h1 style={{textTransform: 'uppercase',fontWeight: 'bolder',paddingTop:'23px',fontSize: '29px'}}>data to be transfered</h1>
                <div style={{paddingLeft: '1rem',paddingTop: '19px',paddingBottom: '2rem'}} >
        <Button style={{color: 'white', textShadow: '1px 1px 2px gray',backgroundColor: 'lightgray',fontWeight: 'bold',fontSize:'15px'}} variant="contained" onClick={this.getDetails}><StringTranslator>details</StringTranslator></Button>
                    </div>
              </div>  
              <div className="card" >
                    <div className="card-header text-center">
                        <h5 style={{ fontWeight: 'bold' }}></h5>
                    </div>
                    <div className="card-body mt-2 pt-2 pb-2" >
                        <Grid container spacing={1} >
                                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{textAlign:'center'}}>
                            <AppBar position="static" color="default">
                                <Tabs
                                    value={tabValue}
                                    onChange={(e, newValue) => this.setState({ tabValue: newValue })}
                                    indicatorColor="primary"
                                    textColor="primary"
                                    variant="fullWidth"
                                    scrollButtons="auto"
                                    className="font-weight-bold">
                                    <Tab label={translateString("TRANSFERT")} style={tabValue === 0 ? activeTab : defaultTab} />
                                    <Tab label={translateString("INVENTORY")} style={tabValue === 1 ? activeTab : defaultTab} />
                                    <Tab label={translateString("WORK IN PROGRESS")} disabled />
                                    <Tab label={translateString("GOODS SOLD")} disabled />
                                </Tabs>
                            </AppBar>
                            {tabValue === 0 && <TabContainer>
                            <div className="pt-2 pb-2">
                              <ReactTableComponent 
                              dataTable={  dataTransfert}
                              transferColumn={acctcolumns}
                              />
                            </div>
                        </TabContainer>}
                        {tabValue === 1 && <TabContainer>
                            <div className="pt-2 pb-2">
                            <ReactTableComponent 
                             dataTable={dataInventory} 
                             transferColumn={inventorycolumns}
                              />
                            </div>
                        </TabContainer>}
                        </Grid>
                        </Grid>
                        </div>
                    <div className="card-footer text-center">
                        <h5 style={{ fontWeight: 'bold' }}></h5>
                    </div>
                </div>
            </Paper>
                </div>
                    <div style={{paddingLeft:'12px',paddingTop: '1rem'}} className="d-flex flex-row flex-wrap  font-weight-bold ">
                        <Button style={{color: 'white',backgroundColor: 'var(--primary-color)',fontSize: '18px'}}  href="#test" variant="contained">transfert</Button>
                    </div>
                                       </div>



                                       </div>
         );
    }
}

function mapStateToProps(state: AppState) {
   
    return {
        state
    };
}


export default connect(mapStateToProps, null)(AccountTransfer)



