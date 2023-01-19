import { useContext, useEffect } from "react";
import { Can } from "../components/Can";
import { AuthContext } from "../context/AuthContext";
import { setupApiClient } from "../service/api";
import { api } from "../service/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard(){
 const { user } = useContext(AuthContext)

 

 useEffect(() => {
   api.get('/me')
   .then(response => console.log(response))
   .catch(err => console.log(err));
 }, [])
 

 return (
    <>
    <h1>Dashboard: {user?.email}</h1>

    <Can permissions={['metrics.list']}>
      <div> Métricas </div>
    </Can>

    </>
 )
}

export const getServerSideProps = withSSRAuth(async(ctx) => {
  const apiClient = setupApiClient(ctx);
  const response = await apiClient.get('me');

  return{
    props:{}
  }
})