let BaseErrCode = 1400
module.exports = {
  Err: {
    FA_INVALID_USER: {
      err: BaseErrCode++,
      msg: 'Invalid User'
    },
    FA_INVALID_ACCOUNT: {
      err: BaseErrCode++,
      msg: 'Invalid Account'
    },
    FA_ACCOUNT_LOCKED: {
      err: BaseErrCode++,
      msg: 'Account Locked'
    },
    FA_ACCOUNT_CANCELED: {
      err: BaseErrCode++,
      msg: 'Account Canceled'
    },
    FA_INVALID_CT: {
      err: BaseErrCode++,
      msg: 'Invalid Currency'
    },
    FA_INVALID_AMOUNT: {
      err: BaseErrCode++,
      msg: 'Invalid Amount'
    },
    FA_INVALID_ALLAMOUNT: {
      err: BaseErrCode++,
      msg: 'Invalid allAmount, Must Be 0 Or 1'
    },
    FA_INVALID_BALANCE: {
      err: BaseErrCode++,
      msg: 'Invalid Balance'
    },
    FA_OUTOF_BALANCE: {
      err: BaseErrCode++,
      msg: 'Out of Balance'
    },
    FA_SELF_TRANSFER: {
      err: BaseErrCode++,
      msg: 'Self Transfer Forbidden'
    }
  }
}
