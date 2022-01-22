import { t, Trans } from "@lingui/macro";
import { Box, Button, Slide, Typography } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { useWeb3Context } from "src/hooks/web3Context";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";

import ConnectButton from "../../components/ConnectButton/ConnectButton";
import { prettifySeconds, prettyVestingPeriod, secondsUntilBlock, trim } from "../../helpers";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { redeemBond } from "../../slices/BondSlice";
import { DisplayBondDiscount } from "./BondV2";

function BondRedeem({ bond }) {
  // const { bond: bondName } = bond;
  const dispatch = useAppDispatch();
  const { provider, address, networkId } = useWeb3Context();

  const isBondLoading = useAppSelector(state => state.bonding.loading ?? true);

  const currentBlock = useAppSelector(state => {
    return state.app.currentBlock;
  });
  const pendingTransactions = useAppSelector(state => {
    return state.pendingTransactions;
  });
  const bondingState = useAppSelector(state => {
    return state.bonding && state.bonding[bond.name];
  });
  const bondDetails = useAppSelector(state => {
    return state.account.bonds && state.account.bonds[bond.name];
  });

  async function onRedeem({ autostake }) {
    await dispatch(redeemBond({ address, bond, networkID: networkId, provider, autostake }));
  }

  const vestingTime = () => {
    return prettyVestingPeriod(currentBlock, bond.bondMaturationBlock);
  };

  const vestingPeriod = () => {
    const vestingBlock = parseInt(currentBlock) + parseInt(bondingState.vestingTerm);
    const seconds = secondsUntilBlock(currentBlock, vestingBlock);
    return prettifySeconds(seconds, "day");
  };

  // useEffect(() => {
  //   console.log(bond);
  //   console.log(bondingState);
  //   console.log(bondDetails);
  // }, []);

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" justifyContent="space-around" flexWrap="wrap">
        {!address ? (
          <ConnectButton />
        ) : (
          <>
            <Button
              variant="contained"
              color="primary"
              id="bond-claim-btn"
              className="transaction-button"
              fullWidth
              disabled={isPendingTxn(pendingTransactions, "redeem_bond_" + bond.name) || bond.pendingPayout == 0.0}
              onClick={() => {
                onRedeem({ autostake: false });
              }}
            >
              {txnButtonText(pendingTransactions, "redeem_bond_" + bond.name, t`Claim`)}
            </Button>
            <Button
              variant="contained"
              color="primary"
              id="bond-claim-autostake-btn"
              className="transaction-button"
              fullWidth
              disabled={
                isPendingTxn(pendingTransactions, "redeem_bond_" + bond.name + "_autostake") ||
                bond.pendingPayout == 0.0
              }
              onClick={() => {
                onRedeem({ autostake: true });
              }}
            >
              {txnButtonText(pendingTransactions, "redeem_bond_" + bond.name + "_autostake", t`Claim and Autostake`)}
            </Button>
          </>
        )}
      </Box>
      <Slide direction="right" in={true} mountOnEnter unmountOnExit {...{ timeout: 533 }}>
        <Box className="bond-data">
          <div className="data-row">
            <Typography>
              <Trans>Pending Rewards</Trans>
            </Typography>
            <Typography className="price-data">
              {isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.interestDue, 4)} OHM`}
            </Typography>
          </div>
          <div className="data-row">
            <Typography>
              <Trans>Claimable Rewards</Trans>
            </Typography>
            <Typography id="claimable" className="price-data">
              {isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.pendingPayout, 4)} OHM`}
            </Typography>
          </div>
          <div className="data-row">
            <Typography>
              <Trans>Time until fully vested</Trans>
            </Typography>
            <Typography className="price-data">{isBondLoading ? <Skeleton width="100px" /> : vestingTime()}</Typography>
          </div>

          <div className="data-row">
            <Typography>
              <Trans>ROI</Trans>
            </Typography>
            <Typography>
              {isBondLoading ? <Skeleton width="100px" /> : <DisplayBondDiscount key={bond.name} bond={bond} />}
            </Typography>
          </div>

          <div className="data-row">
            <Typography>
              <Trans>Debt Ratio</Trans>
            </Typography>
            <Typography>
              {isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.debtRatio / 10000000, 2)}%`}
            </Typography>
          </div>

          <div className="data-row">
            <Typography>
              <Trans>Vesting Term</Trans>
            </Typography>
            <Typography>{isBondLoading ? <Skeleton width="100px" /> : vestingPeriod()}</Typography>
          </div>
        </Box>
      </Slide>
    </Box>
  );
}

export default BondRedeem;
