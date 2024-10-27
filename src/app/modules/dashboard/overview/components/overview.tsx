import { auth } from "@/auth";
import DashboardOverview from "@/components/dashboard-overview";
import { get7daysDataFromAll, getLiveData } from "@/lib/firebase/firestore";

const overview = async () => {
  const session = await auth();
  const user = session?.user;
  let data: any;
  let table: any;
  if (user) {
    if (user.email) {
      data = await get7daysDataFromAll(user?.email, "analytics");
      table = await getLiveData(user?.email);
    }
  }

  // console.log("@@@@@@@@@@@@@@@@@@@@@", user);
  return (
    <div>
      <DashboardOverview user={user} data={data} table={table} />
    </div>
  );
};

export default overview;
