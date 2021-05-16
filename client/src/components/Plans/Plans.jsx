import React, { useEffect, useState } from "react";
import { utils } from "ethers";
import { useToasts, Table } from "@geist-ui/react";

function Plans({ writeContracts }) {
  const [plans, setPlans] = useState([]);
  const [data, setData] = useState([]);
  const [toasts, setToast] = useToasts();

  const showAlert = (alertMessage, alertColor) => {
    setToast({
      text: alertMessage,
      type: alertColor,
    });
  };

  useEffect(() => {
    async function init() {
      try {
        const plansCountArray = Array(Number(await writeContracts.SafexMain.plansCount())).fill(0);
        let plans = [];
        plansCountArray.forEach(async (_, i) => {
          const plan = await writeContracts.SafexMain.plans(i + 1);
          plans.push(plan);
          if (i === plansCountArray.length - 1) {
            setPlans(plans);
          }
        });
      } catch (e) {
        if (e.data !== undefined) {
          const error = e.data.message.split(":")[2].split("revert ")[1];
          showAlert(error + "!", "warning");
        } else {
          showAlert("Error!", "warning");
        }
      }
    }
    init();
  }, [writeContracts]);

  useEffect(() => {
    function init() {
      let newData = [];
      plans.map((plan) => {
        const dataItem = {
          planId: String(plan.planId),
          planCreatedBy:
            plan.planCreatedBy.substr(0, 5) + "..." + plan.planCreatedBy.slice(plan.planCreatedBy.length - 5),
          planCurrentOwner:
            plan.planCurrentOwner.substr(0, 5) + "..." + plan.planCurrentOwner.slice(plan.planCurrentOwner.length - 5),
          planInheritor:
            plan.planInheritor.substr(0, 5) + "..." + plan.planInheritor.slice(plan.planInheritor.length - 5),
          claimsCount: String(plan.claimsCount),
          planFunds: utils.formatEther(plan.planFunds) + " ETH",
        };
        newData.push(dataItem);
      });
      setData(newData);
    }
    init();
  }, [plans]);

  return (
    <>
      <Table data={data}>
        <Table.Column prop="planId" label="Plan Id" />
        <Table.Column prop="planCreatedBy" label="Created By" />
        <Table.Column prop="planCurrentOwner" label="Owned By" />
        <Table.Column prop="planInheritor" label="Inheritor" />
        <Table.Column prop="claimsCount" label="Claims" />
        <Table.Column prop="planFunds" label="Plan Funds" />
      </Table>
    </>
  );
}

export default Plans;
