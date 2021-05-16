import React, { useEffect, useState } from "react";
import { utils } from "ethers";
import { Text, Divider, Spacer, Snippet, Table, Tag, Row, Col } from "@geist-ui/react";

function MyAccount({ address, balance, writeContracts }) {
  const [plans, setPlans] = useState([]);
  const [planData, setPlanData] = useState([]);
  const [claims, setClaims] = useState([]);
  const [claimData, setClaimData] = useState([]);

  useEffect(() => {
    async function init() {
      try {
        const plansCountArray = Array(Number(await writeContracts.SafexMain.plansCount())).fill(0);
        const claimsCountArray = Array(Number(await writeContracts.SafexMain.claimsCount())).fill(0);
        let plans = [];
        let claims = [];
        plansCountArray.forEach(async (_, i) => {
          const plan = await writeContracts.SafexMain.plans(i + 1);
          plans.push(plan);
          if (i === plansCountArray.length - 1) {
            setPlans(plans);
          }
        });
        claimsCountArray.forEach(async (_, i) => {
          const claim = await writeContracts.SafexMain.claims(i);
          claims.push(claim);
          if (i === claimsCountArray.length - 1) {
            setClaims(claims);
          }
        });
      } catch (e) {
        console.log(e);
      }
    }
    init();
  }, [writeContracts]);

  useEffect(() => {
    function init() {
      const myPlans = plans.filter((plan) => plan.planCurrentOwner === address);
      const myClaims = claims.filter((claim) => claim.claimedBy === address);
      let newPlanData = [];
      let newClaimData = [];
      myPlans.map((plan) => {
        const dataItem = {
          planId: String(plan.planId),
          planCreatedBy:
            plan.planCreatedBy.substr(0, 5) + "..." + plan.planCreatedBy.slice(plan.planCreatedBy.length - 5),
          planInheritor:
            plan.planInheritor.substr(0, 5) + "..." + plan.planInheritor.slice(plan.planInheritor.length - 5),
          claimsCount: String(plan.claimsCount),
          planFunds: utils.formatEther(plan.planFunds) + " ETH",
        };
        newPlanData.push(dataItem);
      });
      myClaims.map((claim) => {
        const dataItem = {
          planId: String(claim.planId),
          disputeId: String(claim.disputeId),
          result:
            (claim.result === "Active" && (
              <Tag type="secondary" invert>
                Active
              </Tag>
            )) ||
            (claim.result === "Passed" && (
              <Tag type="success" invert>
                Passed
              </Tag>
            )) ||
            (claim.result === "Failed" && (
              <Tag type="error" invert>
                Failed
              </Tag>
            )),
        };
        newClaimData.push(dataItem);
      });
      setPlanData(newPlanData);
      setClaimData(newClaimData);
    }
    init();
  }, [plans, claims]);

  return (
    <>
      <Text b>Account address :</Text>
      <Spacer />
      <Snippet text={address} type="lite" filled symbol="" width="390px" />
      <Divider />
      <Text b>Account balance :</Text>
      <Text>
        {balance !== undefined ? utils.formatEther(balance) : ""}
        <Spacer inline x={0.35} />
        ETH
      </Text>
      <Divider />
      <Row>
        <Col span={16}>
          <Text b>My Plans :</Text>
          <Spacer />
          {planData.length !== 0 ? (
            <>
              <Table data={planData}>
                <Table.Column prop="planId" label="Plan Id" />
                <Table.Column prop="planCreatedBy" label="Created By" />
                <Table.Column prop="planInheritor" label="Inheritor" />
                <Table.Column prop="claimsCount" label="Claims" />
                <Table.Column prop="planFunds" label="Plan Funds" />
              </Table>
            </>
          ) : (
            <Text style={{ marginTop: "0px" }}>No active claims.</Text>
          )}
        </Col>
        <Spacer x={2} />
        <Col span={8}>
          <Text b>My Claims :</Text>
          <Spacer />
          {claimData.length !== 0 ? (
            <>
              <Table data={claimData}>
                <Table.Column prop="planId" label="Plan Id" />
                <Table.Column prop="disputeId" label="Dispute Id" />
                <Table.Column prop="result" label="Status" />
              </Table>
            </>
          ) : (
            <Text style={{ marginTop: "0px" }}>No active plans.</Text>
          )}
        </Col>
      </Row>
    </>
  );
}

export default MyAccount;
