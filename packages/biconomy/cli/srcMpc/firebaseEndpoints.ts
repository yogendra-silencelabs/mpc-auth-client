// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { SdkError, ErrorCode } from './error';
import { config } from 'dotenv';

config();

const baseUrl = process.env.FIREBASE_BASEURL;


interface Response {
	response: any;
	error: string;
}

const modifiedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
	return await fetch(input, init)
		.then(async (data) => {
			const temp: Response = await data.json();
			if (temp.error) {
				throw new SdkError(temp.error, ErrorCode.FirebaseError);
			} else return temp.response;
		})
		.catch((error) => {
			console.log(error);
			if (error instanceof SdkError) {
				
				throw error;
			}
			if (error instanceof Error) {
				throw error;
			} else
				throw new SdkError(
					`unkown-error`,
					ErrorCode.FirebaseError,
				);
		});
};

export const getTokenEndpoint = async (
	pairingId: string,
	signature: string,
) => {
	const url = baseUrl + `/getToken`;
	const data: {
		token: string;
		appPublicKey: string;
		deviceName: string;
		tokenExpiration: number;
		backupData?: string;
	} = await modifiedFetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ pairingId, signature }),
	});
	return data;
};

export const refreshTokenEndpoint = async (
	token: string,
	signedToken: string,
) => {
	const url = baseUrl + `/refreshToken`;
	const data: {
		token: string;
		tokenExpiration: number;
	} = await modifiedFetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			signedToken,
		}),
	});
	return data;
};

export const sendMessage = async <T>(
	token: string,
	type: 'keygen' | 'sign' | 'pairing' | 'backup',
	conversation: T | null,
	expectResponse: boolean,
	docId?: string,
) => {
	const url = baseUrl + `/sendMessage`;
	const data: T | null = await modifiedFetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			collection: type,
			data: conversation,
			expectResponse,
			docId,
		}),
	});
	return data;
};

export const snapVersion = async () => {
	const url = baseUrl + `/snapVersion`;
	const data = await fetch(url);
	return await data.text();
};
