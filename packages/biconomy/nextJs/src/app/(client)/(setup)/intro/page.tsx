// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.
"use client";

import React from "react";
import { Button } from "@/components/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { WALLET_STATUS } from "@/constants";
import { RouteLoader } from "@/components/routeLoader";
import { layoutClassName } from "@/utils/ui";
import { getPairingStatus, setPairingStatus } from "@/storage/localStorage";
import { useMpcAuth } from "@/hooks/useMpcAuth";
import { BaseError } from "@silencelaboratories/mpc-sdk";

function Page() {
    const mpcAuth = useMpcAuth();
    const router = useRouter();

    (async () => {
        try {
            const eoa = await mpcAuth.accountManager.getEoa();
            const account =
                await mpcAuth.accountManager.getSmartContractAccount();
            if (eoa && !account) {
                setPairingStatus(WALLET_STATUS.BackedUp);
                router.replace("/mint");
                return;
            }
            setPairingStatus(WALLET_STATUS.Minted);
            router.replace("/homescreen");
            return;
        } catch (error) {
            if (error instanceof BaseError) {
                console.error(error.message);
            }
        }
    })();

    const nextPageClick = () => {
        router.replace("/pair");
    };

    const status = getPairingStatus();
    if (status !== WALLET_STATUS.Unpaired) {
        return <RouteLoader />;
    }
    return (
        <div className={layoutClassName}>
            <div
                className="text-black h2-bold"
                style={{
                    fontFamily: "Epilogue",
                    fontSize: "24px",
                    fontWeight: 800,
                    lineHeight: "38px",
                    letterSpacing: "0px",
                }}
            >
                Eliminate Single Points of failure with
                <br />
                Distributed Smart Contract Accounts
            </div>
            <div
                className="text-black"
                style={{
                    fontFamily: "Epilogue",
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: "22px",
                    letterSpacing: "0px",
                    marginTop: "24px",
                }}
            >
                A beautiful confluence between{" "}
                <span className="text-[#745EF6] b2-bold">
                    Multi Party Computation
                </span>{" "}
                and{" "}
                <span className="text-[#745EF6] b2-bold">
                    Account Abstraction
                </span>{" "}
                to enable a 2FA- like experience
            </div>
            <br />

            <div className="flex items-center justify-center">
                <Image
                    priority={true}
                    src="/aaxmpc.gif"
                    alt="logo 1"
                    className="m-auto rounded-[12px]"
                    width="414"
                    height="264"
                />
            </div>

            <Button
                className="bg-indigo-primary hover:bg-indigo-hover active:bg-indigo-active w-full self-center mt-8"
                onClick={nextPageClick}
            >
                Pair with phone
            </Button>
        </div>
    );
}

export default Page;
