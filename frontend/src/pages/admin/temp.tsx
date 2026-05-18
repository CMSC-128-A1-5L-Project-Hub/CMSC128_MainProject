
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <div className="flex flex-col h-full gap-6">
            
            <Card className="flex flex-col flex-1 rounded-2xl bg-white p-6 shadow-sm mb-6">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                
                <div className="flex items-center gap-2">
                  
                </div>
              </div>
              
                  {/* FOOTER */}
                  <div className="mt-6 flex flex-col flex-1 w-full">
                    <hr className="border-[#F2D9DF] border-t" />
                    <div className="flex flex-row justify-between">
                      <p className="text-[13px] text-[#A06B7C] items-center self-center justify-center">
                        Showing {Math.min((currentPage - 1) * rows + 1, filteredAccommodations.length)}–
                        {Math.min(currentPage * rows, filteredAccommodations.length)} of{" "}
                        {filteredAccommodations.length} accommodations
                      </p>
                      <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                    
                  </div>
                </>
              )}
            </Card>
          </div>
        </main>
      </div>

      <AccommodationVerificationModal
        open={isModalOpen}
        onClose={handleCloseModal}
        selectedItem={selectedItem}
        verifyingAccommodationId={verifyingAccommodationId}
        onApprove={async (id) => {
          await verifyAccommodationMutation.mutateAsync({ id, status: "verified" })
          handleCloseModal()
        }}
        onReject={async (id) => {
          await verifyAccommodationMutation.mutateAsync({ id, status: "rejected" })
          handleCloseModal()
        }}
      />