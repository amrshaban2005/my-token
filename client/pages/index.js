import React, { Component } from 'react';
import getWeb3 from '../ethereum/getWeb3';
import MyToken from "../ethereum/build/MyToken.json";
import MyTokenSale from "../ethereum/build/MyTokenSale.json";
import { Button, Form, Input, Message, FormField } from 'semantic-ui-react';
import Layout from '../components/layout';



class Home extends Component {

  state = {
    web3: null,
    accounts: null,
    account: null,
    mytokenInstance: null,
    mytokenSaleInstance: null,
    tokenPrice: 0,
    tokenBalance: 0,
    numberofToken: 1,
    tokenSold: 0,
    tokenAvaliable: 750000,
    errorMessage: '',
    loading: false
  }

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();

      const deployedNetwork1 = MyToken.networks[networkId];
      const deployedNetwork2 = MyTokenSale.networks[networkId];

      const mytokenInstance = new web3.eth.Contract(MyToken.abi,
        deployedNetwork1 && deployedNetwork1.address,
      );
      const mytokenSaleInstance = new web3.eth.Contract(MyTokenSale.abi,
        deployedNetwork2 && deployedNetwork2.address,
      );


      this.setState({ web3, accounts, mytokenInstance, mytokenSaleInstance }, this.loadData);
    }
    catch (error) {
      console.log(error);
    }
  }

  loadData = async () => {
    try {
      const { mytokenInstance, mytokenSaleInstance, web3 } = this.state;

      let account = await web3.eth.getCoinbase();
      let tokenPrice = await mytokenSaleInstance.methods.tokenPrice().call();
      let tokenBalance = await mytokenInstance.methods.balanceOf(account).call();
      let tokenSold = await mytokenSaleInstance.methods.tokenSold().call();
      this.setState({ tokenPrice, tokenBalance, account, tokenSold });
    } catch (error) {
      console.log(error);
    }
  }

  onSubmit = async (event) => {
    this.setState({ errorMessage: '', loading: true });
    event.preventDefault();
    try {
      const { mytokenSaleInstance, account } = this.state;
      await mytokenSaleInstance.methods.buyTokens(this.state.numberofToken).send({ from: account, value: this.state.tokenPrice * this.state.numberofToken });
      this.setState({ numberofToken: 1 });
      this.loadData();
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
    this.setState({ loading: false });
  }

  render() {
    const web3 = this.state.web3;
    if (!web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    const tokenPrice = web3.utils.fromWei(this.state.tokenPrice.toString(), 'ether');
    return (
      <Layout>
        <div >
          <div >
            <h1 >My Token ICO SALE</h1>
            <hr />
            <br />
          </div>
          <div >
            <p>Introducing "My Token" (DAPP)! Token price is  {tokenPrice} Ether.
           You Currently have {this.state.tokenBalance} MyToken </p>
            <br />

            <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
              <Form.Field>
                <Input focus
                  value={this.state.numberofToken}
                  onChange={event => this.setState({ numberofToken: event.target.value })}
                />
              </Form.Field>
              <Button primary loading={this.state.loading}>Buy Tokens</Button>
              <Message error header="Oops!" content={this.state.errorMessage} />
            </Form>
            <br />
            <p>{this.state.tokenSold} / {this.state.tokenAvaliable} Tokens sold</p>
            <hr />
            <p>Your Account: {this.state.account}</p>
          </div>
        </div>

      </Layout>
    );
  }
}

export default Home;