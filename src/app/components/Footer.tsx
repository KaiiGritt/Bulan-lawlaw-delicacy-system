export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Lawlaw Delights</h3>
            <p>Your source for fresh Lawlaw products and delicious recipes.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/products" className="hover:underline">Products</a></li>
              <li><a href="/recipes" className="hover:underline">Recipes</a></li>
              <li><a href="/about" className="hover:underline">About Us</a></li>
              <li><a href="/contact" className="hover:underline">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <p>Bulan, Philippines</p>
            <p>Email: info@lawlawdelights.com</p>
            <p>Phone: +63 XXX XXX XXXX</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p>&copy; 2024 Lawlaw Delights. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
