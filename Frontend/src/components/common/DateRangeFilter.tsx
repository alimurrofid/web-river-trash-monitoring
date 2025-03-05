// import Button from "../ui/button/Button";


// interface DateRangeFilterProps {
//   isOpen: boolean;
//   onClose: () => void;
//   startDate: Date | null;
//   endDate: Date | null;
//   onStartDateChange: (date: Date | null) => void;
//   onEndDateChange: (date: Date | null) => void;
//   onApply: () => void;
//   onReset: () => void;
// }

// /**
//  * Komponen dialog untuk memilih rentang tanggal
//  */
// export function DateRangeFilter({
//   isOpen,
//   onClose,
//   startDate,
//   endDate,
//   onStartDateChange,
//   onEndDateChange,
//   onApply,
//   onReset,
// }: DateRangeFilterProps) {
//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Filter Berdasarkan Tanggal</DialogTitle>
//         </DialogHeader>
//         <div className="grid gap-6 py-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Tanggal Mulai
//               </label>
//               <div className="border rounded-md overflow-hidden">
//                 <Calendar
//                   mode="single"
//                   selected={startDate}
//                   onSelect={onStartDateChange}
//                   className="w-full"
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Tanggal Akhir
//               </label>
//               <div className="border rounded-md overflow-hidden">
//                 <Calendar
//                   mode="single"
//                   selected={endDate}
//                   onSelect={onEndDateChange}
//                   className="w-full"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-between">
//             <Button variant="outline" onClick={onReset}>
//               Reset
//             </Button>
//             <Button onClick={onApply}>Terapkan Filter</Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
