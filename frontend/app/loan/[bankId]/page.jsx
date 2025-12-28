import { banks } from "../bankData";
import Link from "next/link";
import { FiChevronRight, FiCheckCircle } from "react-icons/fi";

const BankDetailPage = async ({ params }) => {
  const resolvedParams = await params;
  const bank = banks.find(b => b.id === Number(resolvedParams.bankId));

  if (!bank) {
    return <div className="text-center py-20">Bank not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
              <img src={bank.logo} alt={bank.name} className="w-24 h-24 object-contain mr-6 mb-4 sm:mb-0" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{bank.name}</h1>
                <p className="text-gray-600 mt-2">{bank.description}</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Loan Products</h2>
          <div className="space-y-6">
            {bank.products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex-1 mb-4 sm:mb-0">
                    <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Amount:</span> {product.amount}</p>
                      <p><span className="font-medium">Tenure:</span> {product.tenure}</p>
                      <p className="font-semibold text-green-600">Interest: {product.interest}</p>
                    </div>
                  </div>
                  <Link
                    href={`/loan/${bank.id}/apply/${product.id}`}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex-shrink-0"
                  >
                    Apply Now
                  </Link>
                </div>
                
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Features</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm text-gray-700">
                        <FiCheckCircle className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BankDetailPage;