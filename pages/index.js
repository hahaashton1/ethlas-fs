import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import Head from 'next/head'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { storeSelect1, storeSelect2, storeSelect3 } from '../slices/formSlice'
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { mainABI, mainAddress } from "../contract"

export default function Home() {

  // Global WAGMI hooks to access the connected wallet
  const { address, isConnected } = useAccount()

  // Redux hook to update global variables in the redux store
  const dispatch = useDispatch()

  // Getting global variables from the redux store
  const cost = useSelector((state) => state.form.cost)
  const val1 = useSelector((state) => state.form.value1)
  const val2 = useSelector((state) => state.form.value2)
  const val3 = useSelector((state) => state.form.value3)

  // Disclaimer:
  // This function is supposed to return data based on a specific user_addr
  // However, it doesn't seem to work and still returns all data
  const getSpecificData = async () => {
    return axios
      .get("https://firestore.googleapis.com/v1/projects/ethlas-project/databases/(default)/documents/transactions?key=AIzaSyD1VnJDlndU8pE_I9zbOtfXxnMqTGTTxeo",
        {
          structuredQuery:
          {
            from: [
              {
                collectionId: "transactions"
              }
            ], select: {
              fields:
                [
                  { fieldPath: "date" },
                  { fieldPath: "is_bubbles" },
                  { fieldPath: "is_cream" },
                  { fieldPath: "tea_latte" },
                  { fieldPath: "total" },
                  { fieldPath: "user_addr" }
                ]
            },
            where: {
              compositeFilter: {
                filters: [
                  {
                    fieldFilter: {
                      field: {
                        fieldPath: 'user_addr'
                      },
                      op: 'EQUAL',
                      value: {
                        stringValue: address
                      }
                    }
                  }
                ]
              }
            },
          }
        })
      .then((res) => {
        //const result = res.data.documents[0].fields.user_addr["stringValue"]
        const result = res.data.documents;
        // console.log(result);
        return result;
      })
  }

  // Function for creating new document in DB
  const createDocument = async () => {
    axios.post("https://firestore.googleapis.com/v1/projects/ethlas-project/databases/(default)/documents/transactions",
      {
        fields: {
          date: { timestampValue: new Date() },
          is_bubbles: { integerValue: val1 },
          is_cream: { integerValue: val2 },
          tea_latte: { integerValue: val3 },
          total: { integerValue: 0 },
          user_addr: { stringValue: address },
        }
      }
    ).then(res => {
      console.log("Document created")
    })
  }

  // WAGMI hook configuration
  const { config } = usePrepareContractWrite({
    addressOrName: mainAddress,
    contractInterface: mainABI,
    functionName: 'claim',
    args: [val1, val2, val3],
  })

  // WAGMI hook for calling claim function
  const buy = useContractWrite({
    ...config,
    onSuccess(data) {
      console.log("Successfully minted!", data);

      // After it the NFT has successfully been minted,
      // Create a receipt/transaction in Firebase
      createDocument();
    }
  });

  // Used for querying Firestore
  const readTx = useQuery(["tx"], getSpecificData, {
    enabled: true,
  });

  // Used for adding document to Firestore
  // const mutation = useMutation(createDocument);

  return (
    <div>
      <Head>
        <title>B0BA3</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="grid place-items-center justify-center">
          <div className="grid grid-cols-1 gap-6 content-center max-w-screen-lg">

            {/* Code segment for mockup code */}
            <div className="mockup-code shadow-2xl mt-4">
              <pre data-prefix="1"><code>Customize your own boba:</code></pre>
              <pre data-prefix="4" className="text-warning"><code>Boba: If yes, +$0.50. Else, +$0</code></pre>
              <pre data-prefix="2" className="text-warning"><code>Foam: If yes, +$0.50. Else, +$0</code></pre>
              <pre data-prefix="3" className="text-warning"><code>Base: If yes, +$1. Else, +$1.50</code></pre>
              <pre data-prefix="5" className="text-success"><code>Shaking up your order!</code></pre>
            </div>

            {/* Code segment for order menu */}
            <div className="card flex-shrink-0 w-full max-w-md shadow-2xl bg-base-100">
              <div className="card-body">
                <div className="form-control w-full max-w-md">
                  <label className="label">
                    <span className="label-text">Bubbles?</span>
                  </label>
                  <select className="select select-bordered"
                    onChange={(e) => { dispatch(storeSelect1(e.target.value)) }}
                    defaultValue=""
                  >
                    <option value="" disabled>-</option>
                    <option value="1">Siao ah? Of course!</option>
                    <option value="0">Nope, tryna stay healthy</option>
                  </select>
                </div>
                <div className="form-control w-full max-w-md">
                  <label className="label">
                    <span className="label-text">Do you want cream?</span>
                  </label>
                  <select className="select select-bordered"
                    onChange={(e) => { dispatch(storeSelect2(e.target.value)) }}
                    defaultValue=""
                  >
                    <option value="" disabled>-</option>
                    <option value="1">I WANT!</option>
                    <option value="0">No, thanks</option>
                  </select>
                </div>
                <div className="form-control w-full max-w-md">
                  <label className="label">
                    <span className="label-text">Tea or Latte?</span>
                  </label>
                  <select className="select select-bordered"
                    onChange={(e) => { dispatch(storeSelect3(e.target.value)) }}
                    defaultValue="">
                    <option value="" disabled>-</option>
                    <option value="1">Tea la...</option>
                    <option value="0">Latte please</option>
                  </select>
                </div>
                <div className="stats shadow mt-4">
                  <div className="stat">
                    <div className="stat-title">Sub-total:</div>
                    <div className="stat-value"><s>{cost} MATIC</s></div>
                  </div>
                </div>

                {/* Only enable buy button if the user is connected to his/her wallet */}
                <div className="flex justify-center">
                  <div className="form-control mt-6">
                    <div className="indicator">
                      <span className="indicator-item badge">Free!</span>
                      {
                        isConnected ? 
                        (<>
                        <button className="btn btn-wide btn-primary" onClick={() => { buy.write() }}>Buy</button>
                        </>) : 
                        (<>
                        <button className="btn btn-wide btn-primary" disabled={true}>Buy</button>
                        </>)
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Only show transaction button if the user is connected to his/her wallet */}
            {
              isConnected &&
              (<>
                <label htmlFor="my-modal-6" className="btn btn-ghost" onClick={() => { readTx.refetch(); console.log(readTx.data);}}>View Transaction History</label>
              </>) 
            }
          </div>
        </div>

        {/* Code segment for transaction modal */}
        <input type="checkbox" id="my-modal-6" className="modal-toggle" />
        <div className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <div className="overflow-x-auto overflow-y-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Bubbles</th>
                    <th>Cream</th>
                    <th>Tea/Latte</th>
                    <th>Total (MATIC)</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    readTx.data && (
                      <>
                        {
                          readTx.data.map((document, index) => {
                              return(
                                <tr key={index}>
                                  <th>{index}</th>
                                  <td>{document.fields.date["timestampValue"]}</td>
                                  <td>{document.fields.is_bubbles["integerValue"]}</td>
                                  <td>{document.fields.is_cream["integerValue"]}</td>
                                  <td>{document.fields.tea_latte["integerValue"]}</td>
                                  <td>{document.fields.total["integerValue"]}</td>
                                </tr>
                              )
                          })
                        }
                      </>
                    )
                  }
                </tbody>
              </table>
            </div>
            <div className="modal-action">
              <label htmlFor="my-modal-6" className="btn">Ok</label>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
